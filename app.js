// Глобальное хранилище данных приложения
let pins = JSON.parse(localStorage.getItem('meore_pins')) || [];
let isAdsRemoved = localStorage.getItem('meore_no_ads') === 'true';
let currentCoords = null;

// Переменные для интеграции с Google Drive REST API
let tokenClient;
let accessToken = null;
const CLIENT_ID = 'ВАШ_GOOGLE_CLIENT_://googleusercontent.com'; // Сюда вставьте ваш ID из Google Console

// Навешиваем обработчики событий после полной загрузки DOM структуры
document.addEventListener('DOMContentLoaded', () => {
    renderPins();
    checkAdsStatus();

    // Привязка кликов к кнопкам интерфейса
    document.getElementById('btnPin').addEventListener('click', getLocation);
    document.getElementById('btnSave').addEventListener('click', addPin);
    document.getElementById('authBtn').addEventListener('click', handleAuthClick);
    document.getElementById('removeAdsBtn').addEventListener('click', removeAdsPurchase);

    // Безопасная инициализация скриптов Google Auth
    if (typeof google !== 'undefined') {
        gapiInit();
    }
});

// 1. ЛОГИКА ДЛЯ КНОПКИ "PIN": Получение геолокации без зависаний
function getLocation() {
    const display = document.getElementById('coordsDisplay');
    const btnPin = document.getElementById('btnPin');
    const btnSave = document.getElementById('btnSave');
    
    if (!navigator.geolocation) {
        display.innerText = "❌ Geolocation is NOT supported by this browser.";
        return;
    }

    display.innerText = "⏳ Locating... Please check permission prompt.";
    btnPin.disabled = true;

    // Конфигурация точности и максимального времени ожидания ответа спутников
    const geoOptions = {
        enableHighAccuracy: true, 
        timeout: 10000, // 10 секунд таймаут
        maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
        (position) => {
            currentCoords = {
                lat: position.coords.latitude.toFixed(6),
                lng: position.coords.longitude.toFixed(6)
            };
            display.innerHTML = `📍 Lat: <b>${currentCoords.lat}</b> | Lng: <b>${currentCoords.lng}</b>`;
            btnSave.disabled = false; // Открываем доступ к кнопке SAVE
            btnPin.disabled = false;  // Возвращаем кнопку PIN в активное состояние
        },
        (error) => {
            btnPin.disabled = false;
            btnSave.disabled = true;
            
            // Обработка критических ошибок геолокации
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    display.innerText = "❌ Error: Access denied by browser settings.";
                    alert("Пожалуйста, разрешите доступ сайту к геопозиции в настройках адресной строки браузера!");
                    break;
                case error.POSITION_UNAVAILABLE:
                    display.innerText = "❌ Error: Position unavailable (Check GPS/Network).";
                    break;
                case error.TIMEOUT:
                    display.innerText = "❌ Error: Location request timed out.";
                    break;
                default:
                    display.innerText = "❌ Error: " + error.message;
                    break;
            }
        },
        geoOptions
    );
}

// 2. ЛОГИКА ДЛЯ КНОПКИ "SAVE": Создание и упаковка структуры пина
function addPin() {
    const noteInput = document.getElementById('noteInput');
    const noteText = noteInput.value.trim() || "Saved Location";

    if (!currentCoords) return;

    const newPin = {
        id: Date.now(),
        note: noteText,
        lat: currentCoords.lat,
        lng: currentCoords.lng,
        date: new Date().toLocaleString()
    };

    pins.unshift(newPin); // Новый элемент отправляется на самый верх списка
    saveToLocal();
    renderPins();

    // Сброс и очистка полей формы для нового захвата
    noteInput.value = '';
    currentCoords = null;
    document.getElementById('coordsDisplay').innerText = "Coordinates: Not captured yet";
    document.getElementById('btnSave').disabled = true;

    // Автоматическая фоновая отправка данных в облако, если юзер залогинен в Google
    if (accessToken) {
        savePinsToDrive();
    }
}

// Удаление элемента из коллекции
function deletePin(id) {
    pins = pins.filter(pin => pin.id !== id);
    saveToLocal();
    renderPins();
    if (accessToken) savePinsToDrive();
}

// Запись в локальное хранилище браузера (песочница/оффлайн-режим)
function saveToLocal() {
    localStorage.setItem('meore_pins', JSON.stringify(pins));
}

// Рендеринг текстового списка структуры пинов
function renderPins() {
    const listContainer = document.getElementById('pinsList');
    listContainer.innerHTML = '';

    if (pins.length === 0) {
        listContainer.innerHTML = '<p style="color: #555; text-align: center; margin-top: 20px;">No saved locations yet.</p>';
        return;
    }

    pins.forEach(pin => {
        const item = document.createElement('div');
        item.className = 'pin-item';
        item.innerHTML = `
            <div class="pin-info">
                <div class="pin-note">${escapeHtml(pin.note)}</div>
                <div class="pin-coords">📍 ${pin.lat}, ${pin.lng}</div>
                <div class="pin-date">${pin.date}</div>
            </div>
            <button class="delete-btn" data-id="${pin.id}">✕</button>
        `;
        
        // Вешаем событие удаления через дата-атрибут
        item.querySelector('.delete-btn').addEventListener('click', (e) => {
            const targetId = parseInt(e.target.getAttribute('data-id'));
            deletePin(targetId);
        });

        listContainer.appendChild(item);
    });
}

// 3. СИНХРОНИЗАЦИЯ С GOOGLE DRIVE REST API V3
function gapiInit() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: 'https://googleapis.com',
        callback: (tokenResponse) => {
            if (tokenResponse.error !== undefined) throw (tokenResponse);
            accessToken = tokenResponse.access_token;
            
            const authBtn = document.getElementById('authBtn');
            authBtn.innerText = "Synced";
            authBtn.classList.add('active');
            
            // Выкачиваем данные из облака сразу после авторизации
            loadPinsFromDrive();
        },
    });
}

function handleAuthClick() {
    if (tokenClient) {
        tokenClient.requestAccessToken({prompt: accessToken === null ? 'consent' : ''});
    } else {
        alert("Google API client script is not loaded yet or blocked by privacy extensions.");
    }
}

// Отправка JSON бэкапа в скрытый раздел Google Drive (AppDataFolder)
function savePinsToDrive() {
    const metadata = { name: 'meore_backup.json', mimeType: 'application/json', parents: ['appDataFolder'] };
    const file = new Blob([JSON.stringify(pins)], {type: 'application/json'});
    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
    formData.append('file', file);

    fetch('https://googleapis.com', {
        method: 'POST',
        headers: new Headers({'Authorization': 'Bearer ' + accessToken}),
        body: formData
    })
    .then(res => res.json())
    .then(data => console.log('Cloud update success. FileID:', data.id))
    .catch(err => console.error('Cloud upload error:', err));
}

// Получение и мерж данных из файла meore_backup.json на диске Google
function loadPinsFromDrive() {
    fetch('https://googleapis.com"meore_backup.json"', {
        headers: new Headers({'Authorization': 'Bearer ' + accessToken})
    })
    .then(res => res.json())
    .then(data => {
        if (data.files && data.files.length > 0) {
            return fetch(`https://googleapis.com{data.files[0].id}?alt=media`, {
                headers: new Headers({'Authorization': 'Bearer ' + accessToken})
            });
        }
    })
    .then(res => { if(res) return res.json(); })
    .then(cloudPins => {
        if (cloudPins && cloudPins.length > 0) {
            // Слияние локальной базы и облачной без дублирования по ID элемента
            const merged = [...pins, ...cloudPins];
            pins = Array.from(new Map(merged.map(item => [item.id, item])).values());
            pins.sort((a,b) => b.id - a.id);
            saveToLocal();
            renderPins();
        }
    })
    .catch(err => console.error('Cloud download error:', err));
}

// Экранирование HTML строк для защиты от XSS инъекций
function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// Эмуляция встроенной покупки отключения рекламы (In-App Purchases)
function removeAdsPurchase(event) {
    event.preventDefault();
    if(confirm("Simulate Google Play In-App Purchase to remove ads?")) {
        localStorage.setItem('meore_no_ads', 'true');
        isAdsRemoved = true;
        checkAdsStatus();
    }
}

// Контроль видимости рекламных блоков на экране
function checkAdsStatus() {
    const adContainer = document.getElementById('adContainer');
    if (isAdsRemoved && adContainer) {
        adContainer.style.display = 'none';
    }
}
