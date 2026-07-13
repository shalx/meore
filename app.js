// === ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ДЛЯ КООРДИНАТ ===
let currentLatitude = null;
let currentLongitude = null;
let currentAltitude = null;

// === НАСТРОЙКИ GOOGLE SYNC ===
let tokenClient = null;
let accessToken = null;
const CLIENT_ID = 'ВАШ_CLIENT_://googleusercontent.com'; // ЗАМЕНИТЕ НА ВАШ ID ИЗ GOOGLE CONSOLE
const SCOPES = 'https://googleapis.com';

// Массив для сохраненных локаций (загружаем из памяти браузера или создаем пустой)
let savedLocations = JSON.parse(localStorage.getItem('meore_locations')) || [];

// Автоматически отрисовываем сохраненные точки при загрузке страницы
document.addEventListener("DOMContentLoaded", renderLocations);

// === 1. ФУНКЦИЯ ОПРЕДЕЛЕНИЯ ГЕОПОЗИЦИИ (КНОПКА PIN) ===
function getLocation() {
  const display = document.getElementById('coordinates-display');
  display.innerText = "Определяю местоположение...";

  const options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);
  } else {
    display.innerText = "Геолокация не поддерживается браузером.";
  }
}

function successCallback(position) {
  const display = document.getElementById('coordinates-display');
  
  // Сохраняем полученные данные в глобальные переменные
  currentLatitude = position.coords.latitude;
  currentLongitude = position.coords.longitude;
  currentAltitude = position.coords.altitude;
  
  let altitudeText = currentAltitude !== null ? `${currentAltitude.toFixed(1)} м` : "не определена";

  display.innerHTML = `
    <strong>Широта (Latitude):</strong> ${currentLatitude}<br>
    <strong>Долгота (Longitude):</strong> ${currentLongitude}<br>
    <strong>Высота над уровнем моря:</strong> ${altitudeText}
  `;
}

function errorCallback(error) {
  document.getElementById('coordinates-display').innerText = "Ошибка получения геопозиции. Убедитесь, что доступ к геоданным разрешен.";
}

// === 2. ФУНКЦИЯ ЛОКАЛЬНОГО СОХРАНЕНИЯ (КНОПКА SAVE) ===
function saveLocation() {
  if (currentLatitude === null || currentLongitude === null) {
    alert("Сначала нажмите кнопку PIN, чтобы получить координаты!");
    return;
  }

  const noteInput = document.getElementById('note-input');
  const noteText = noteInput.value.trim() || "Без названия";

  // Создаем объект новой точки
  const newLocation = {
    id: Date.now(), // Уникальный ID для удаления
    lat: currentLatitude,
    lng: currentLongitude,
    alt: currentAltitude !== null ? `${currentAltitude.toFixed(1)} м` : "не определена",
    note: noteText,
    time: new Date().toLocaleString()
  };

  // Добавляем в массив и обновляем локальное хранилище
  savedLocations.push(newLocation);
  localStorage.setItem('meore_locations', JSON.stringify(savedLocations));
  
  renderLocations(); // Перерисовываем список на экране
  noteInput.value = ""; // Очищаем поле ввода
}

// === 3. ФУНКЦИЯ ОТРИСОВКИ КАРТОЧЕК НА СТРАНИЦЕ ===
function renderLocations() {
  const listContainer = document.getElementById('locations-list');
  listContainer.innerHTML = ""; // Очищаем старый список

  if (savedLocations.length === 0) {
    listContainer.innerText = "Список пуст.";
    return;
  }

  savedLocations.forEach(loc => {
    const locDiv = document.createElement('div');
    // Минимальное оформление инлайном, так как CSS мы удалили
    locDiv.setAttribute('style', 'border: 1px solid black; margin: 10px 0; padding: 5px;');

    locDiv.innerHTML = `
      <strong>${loc.note}</strong> 
      <button onclick="deleteLocation(${loc.id})">X</button><br>
      📍 ${loc.lat}, ${loc.lng}<br>
      Высота: ${loc.alt}<br>
      <small>${loc.time}</small>
    `;
    listContainer.appendChild(locDiv);
  });
}

// === 4. ФУНКЦИЯ УДАЛЕНИЯ ОДНОЙ КАРТОЧКИ (КНОПКА X) ===
function deleteLocation(id) {
  savedLocations = savedLocations.filter(loc => loc.id !== id);
  localStorage.setItem('meore_locations', JSON.stringify(savedLocations));
  renderLocations();
}

// === 5. ИНИЦИАЛИЗАЦИЯ КЛИЕНТА GOOGLE AUTH ===
function initGoogleClient() {
  if (typeof google !== 'undefined' && google.accounts && google.accounts.oauth2) {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (tokenResponse) => {
        if (tokenResponse && tokenResponse.access_token) {
          accessToken = tokenResponse.access_token;
          console.log("Авторизация в Google успешна!");
          uploadDataToGoogleDrive(); // Сразу выгружаем данные после входа
        }
      },
    });
  }
}

// === 6. ОБРАБОТЧИК НАЖАТИЯ НА КНОПКУ GOOGLE SYNC ===
function handleSyncClick() {
  // Защита на случай блокировки скрипта браузером или расширениями
  if (typeof google === 'undefined' || !google.accounts || !google.accounts.oauth2) {
    alert('Браузер блокирует загрузку скрипта Google. Попробуйте отключить расширения или открыть сайт в режиме Инкогнито (Ctrl+Shift+N).');
    return;
  }

  // Если клиент авторизации еще не создан — создаем его
  if (!tokenClient) {
    initGoogleClient();
  }

  // Запускаем процесс авторизации или сразу обновляем файл в облаке
  if (accessToken === null) {
    tokenClient.requestAccessToken({ prompt: 'consent' });
  } else {
    uploadDataToGoogleDrive();
  }
}

// === 7. ОТПРАВКА ДАННЫХ В СКРЫТУЮ ПАПКУ GOOGLE ДИСКА ===
async function uploadDataToGoogleDrive() {
  const locationsData = localStorage.getItem('meore_locations') || '[]';
  
  const fileMetadata = {
    name: 'meore_backup.json',
    parents: ['appDataFolder'] // Специальная папка Google Drive для данных приложений
  };

  const boundary = 'foo_bar_baz';
  const delimiter = `\r\n--${boundary}\r\n`;
  const close_delim = `\r\n--${boundary}--`;

  const body =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(fileMetadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      locationsData +
      close_delim;

  try {
    const response = await fetch('https://googleapis.com', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': `multipart/boundary=${boundary}`
      },
      body: body
    });
    
    if (response.ok) {
      alert('Успешно! Все локации синхронизированы с вашим Google Диском.');
    } else {
      const errText = await response.text();
      console.error('Ошибка Google Drive API:', errText);
      alert('Ошибка при сохранении на Google Диск. Проверьте правильность Client ID в коде.');
    }
  } catch (error) {
    console.error('Ошибка сети:', error);
    alert('Не удалось связаться с серверами Google из-за ошибки сети.');
  }
}
