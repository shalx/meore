// Хранилище пинов в оперативной памяти (изначально загружается из localStorage)
let pins = JSON.parse(localStorage.getItem('meore_pins')) || [];
let isAdsRemoved = localStorage.getItem('meore_no_ads') === 'true';

// Инициализация при запуске
document.addEventListener('DOMContentLoaded', () => {
    renderPins();
    checkAdsStatus();
});

// Проверка и валидация ссылки
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Добавление нового пина (без карт, только текст)
function addPin() {
    const input = document.getElementById('pinInput');
    const value = input.value.trim();

    if (!value) return;

    const newPin = {
        id: Date.now(),
        content: value,
        isUrl: isValidUrl(value),
        date: new Date().toLocaleDateString()
    };

    pins.unshift(newPin); // Добавляем в начало списка
    saveToLocal();
    renderPins();
    input.value = ''; // Очищаем поле ввода
}

// Удаление пина
function deletePin(id) {
    pins = pins.filter(pin => pin.id !== id);
    saveToLocal();
    renderPins();
}

// Сохранение в LocalStorage (локальный демо-режим)
function saveToLocal() {
    localStorage.setItem('meore_pins', JSON.stringify(pins));
}

// Отрендерить текстовый список на экране
function renderPins() {
    const listContainer = document.getElementById('pinsList');
    listContainer.innerHTML = '';

    if (pins.length === 0) {
        listContainer.innerHTML = '<p style="color: #666; text-align: center;">No pins saved yet.</p>';
        return;
    }

    pins.forEach(pin => {
        const item = document.createElement('div');
        item.className = 'pin-item';

        // Формируем контент: ссылка или простой текст
        const contentHtml = pin.isUrl 
            ? `<a href="${pin.content}" target="_blank">${pin.content}</a>`
            : `<span>${pin.content}</span>`;

        item.innerHTML = `
            <div class="pin-info">
                ${contentHtml}
                <span>Saved on ${pin.date}</span>
            </div>
            <button class="delete-btn" onclick="deletePin(${pin.id})">✕</button>
        `;
        listContainer.appendChild(item);
    });
}

// Заглушка для будущей авторизации через Google Диск
function toggleAuth() {
    alert("In the mobile app, this button will sync data with your personal Google Drive.");
}

// Симуляция покупки отключения рекламы
function removeAdsPurchase(event) {
    event.preventDefault();
    if(confirm("Simulate Google Play In-App Purchase to remove ads?")) {
        localStorage.setItem('meore_no_ads', 'true');
        isAdsRemoved = true;
        checkAdsStatus();
    }
}

// Скрытие рекламы, если она оплачена
function checkAdsStatus() {
    const adContainer = document.getElementById('adContainer');
    if (isAdsRemoved && adContainer) {
        adContainer.style.display = 'none';
    }
}

