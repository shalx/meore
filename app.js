let currentLatitude = null;
let currentLongitude = null;
let currentAltitude = null;

let savedLocations = JSON.parse(localStorage.getItem('meore_locations')) || [];

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

function saveLocation() {
  if (currentLatitude === null || currentLongitude === null) {
    alert("Сначала нажмите кнопку PIN, чтобы получить координаты!");
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
