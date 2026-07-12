// Глобальные переменные для хранения текущей точки
let currentLatitude = null;
let currentLongitude = null;
let currentAltitude = null;

// Массив для сохраненных локаций (загружаем из памяти или создаем пустой)
let savedLocations = JSON.parse(localStorage.getItem('meore_locations')) || [];

// Вызываем отрисовку старых точек при загрузке страницы
document.addEventListener("DOMContentLoaded", renderLocations);

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
  
  // Записываем данные в глобальные переменные
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

// ФУНКЦИЯ СОХРАНЕНИЯ
function saveLocation() {
  if (currentLatitude === null || currentLongitude === null) {
    alert("Сначала нажмите кнопку PIN, чтобы получить координаты!");
    return;
  }

  const noteInput = document.getElementById('note-input');
  const noteText = noteInput.value.trim() || "Без названия";

  // Создаем объект новой локации
  const newLocation = {
    id: Date.now(), // Уникальный ID для удаления
    lat: currentLatitude,
    lng: currentLongitude,
    alt: currentAltitude !== null ? `${currentAltitude.toFixed(1)} м` : "не определена",
    note: noteText,
    time: new Date().toLocaleString()
  };

  // Добавляем в массив, сохраняем в память и обновляем экран
  savedLocations.push(newLocation);
  localStorage.setItem('meore_locations', JSON.stringify(savedLocations));
  
  renderLocations();
  
  // Очищаем поле ввода
  noteInput.value = "";
}

// ФУНКЦИЯ ОТРИСОВКИ СПИСКА
function renderLocations() {
  const listContainer = document.getElementById('locations-list');
  listContainer.innerHTML = ""; // Очищаем старый список

  if (savedLocations.length === 0) {
    listContainer.innerText = "Список пуст.";
    return;
  }

  savedLocations.forEach(loc => {
    const locDiv = document.createElement('div');
    locDiv.style.border = "1px solid black"; // Минимальная визуальная граница без CSS-файлов
    locDiv.style.margin = "10px 0";
    locDiv.style.padding = "5px";

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

// ФУНКЦИЯ УДАЛЕНИЯ КАРТОЧКИ
function deleteLocation(id) {
  // Фильтруем массив, убирая элемент с нужным ID
  savedLocations = savedLocations.filter(loc => loc.id !== id);
  localStorage.setItem('meore_locations', JSON.stringify(savedLocations));
  renderLocations(); // Перерисовываем список
}
