// === ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ===
let currentLatitude = null;
let currentLongitude = null;
let currentAltitude = null;

let tokenClient = null;
let accessToken = null;
const CLIENT_ID = '783371757942-u941c9rvsvna0c7sttr2nj9g0k2dcgei.apps.googleusercontent.com'; // ВСТАВЬТЕ СЮДА ВАШ ID ИЗ GOOGLE CONSOLE
const SCOPES = 'https://googleapis.com';

let savedLocations = JSON.parse(localStorage.getItem('meore_locations')) || [];

document.addEventListener("DOMContentLoaded", renderLocations);

// === ГЕОЛОКАЦИЯ ===
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
  document.getElementById('coordinates-display').innerText = "Ошибка получения геопозиции.";
}

// === ЛОКАЛЬНОЕ СОХРАНЕНИЕ ===
function saveLocation() {
  if (currentLatitude === null || currentLongitude === null) {
    alert("Сначала нажмите кнопку PIN!");
    return;
  }

  const noteInput = document.getElementById('note-input');
  const noteText = noteInput.value.trim() || "Без названия";

  const newLocation = {
    id: Date.now(),
    lat: currentLatitude,
    lng: currentLongitude,
    alt: currentAltitude !== null ? `${currentAltitude.toFixed(1)} м` : "не определена",
    note: noteText,
    time: new Date().toLocaleString()
  };

  savedLocations.push(newLocation);
  localStorage.setItem('meore_locations', JSON.stringify(savedLocations));
  renderLocations();
  noteInput.value = "";
}

function renderLocations() {
  const listContainer = document.getElementById('locations-list');
  listContainer.innerHTML = "";

  if (savedLocations.length === 0) {
    listContainer.innerText = "Список пуст.";
    return;
  }

  savedLocations.forEach(loc => {
    const locDiv = document.createElement('div');
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

function deleteLocation(id) {
  savedLocations = savedLocations.filter(loc => loc.id !== id);
  localStorage.setItem('meore_locations', JSON.stringify(savedLocations));
  renderLocations();
}

// === УМНАЯ АВТОЗАГРУЗКА И СИНХРОНИЗАЦИЯ GOOGLE ===
function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    // Если скрипт уже загружен, сразу выходим
    if (typeof google !== 'undefined' && google.accounts) {
      resolve();
      return;
    }
    // Динамически создаем и внедряем тег скрипта в документ
    const script = document.createElement('script');
    script.src = 'https://google.com';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject();
    document.head.appendChild(script);
  });
}

function initGoogleClient() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: (tokenResponse) => {
      if (tokenResponse && tokenResponse.access_token) {
        accessToken = tokenResponse.access_token;
        uploadDataToGoogleDrive();
      }
    },
  });
}

function handleSyncClick() {
  // Прямая проверка — если объект google на месте, значит скрипт успешно загружен из head
  if (typeof google === 'undefined' || !google.accounts || !google.accounts.oauth2) {
    alert("Критическая ошибка: Браузер или антивирус заблокировал соединение с accounts.google.com. Пожалуйста, проверьте консоль разработчика (F12) во вкладке Console.");
    return;
  }

  if (!tokenClient) {
    initGoogleClient();
  }

  if (accessToken === null) {
    tokenClient.requestAccessToken({ prompt: 'consent' });
  } else {
    uploadDataToGoogleDrive();
  }
}

async function uploadDataToGoogleDrive() {
  const locationsData = localStorage.getItem('meore_locations') || '[]';
  const fileMetadata = { name: 'meore_backup.json', parents: ['appDataFolder'] };
  const boundary = 'foo_bar_baz';
  const delimiter = `\r\n--${boundary}\r\n`;
  const close_delim = `\r\n--${boundary}--`;

  const body = delimiter + 'Content-Type: application/json; charset=UTF-8\r\n\r\n' + JSON.stringify(fileMetadata) +
               delimiter + 'Content-Type: application/json\r\n\r\n' + locationsData + close_delim;

  try {
    const response = await fetch('https://googleapis.com', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': `multipart/boundary=${boundary}` },
      body: body
    });
    
    if (response.ok) {
      alert('Успешно! Локации синхронизированы с Google Диском.');
    } else {
      alert('Ошибка API. Убедитесь, что правильно указали Client ID в коде app.js.');
    }
  } catch (error) {
    alert('Ошибка сети при отправке данных.');
  }
}
