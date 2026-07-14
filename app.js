// === ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ===
let currentLatitude = null;
let currentLongitude = null;
let currentAltitude = null;

let savedLocations = JSON.parse(localStorage.getItem('meore_locations')) || [];

document.addEventListener("DOMContentLoaded", renderLocations);

// === 1. ГЕОЛОКАЦИЯ ===
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
  
  display.innerHTML = `
    <strong>Широта (Latitude):</strong> ${currentLatitude}<br>
    <strong>Долгота (Longitude):</strong> ${currentLongitude}<br>
    <strong>Высота над уровнем моря:</strong> Запрашиваю 3D-модель Земли...
  `;

  // Отправляем запрос к цифровой модели рельефа Земли
  fetch(`https://open-elevation.com{currentLatitude},${currentLongitude}`)
    .then(response => response.json())
    .then(data => {
      if (data && data.results && data.results[0]) {
        // Получаем точную высоту из спутниковой модели рельефа
        currentAltitude = data.results[0].elevation;
        
        display.innerHTML = `
          <strong>Широта (Latitude):</strong> ${currentLatitude}<br>
          <strong>Долгота (Longitude):</strong> ${currentLongitude}<br>
          <strong>Высота над уровнем моря:</strong> ${currentAltitude.toFixed(1)} м (из модели Земли 🌍)
        `;
      }
    })
    .catch(error => {
      console.error("Ошибка запроса к модели рельефа:", error);
      display.innerHTML = `
        <strong>Широта (Latitude):</strong> ${currentLatitude}<br>
        <strong>Долгота (Longitude):</strong> ${currentLongitude}<br>
        <strong>Высота над уровнем моря:</strong> не удалось загрузить модель рельефа
      `;
    });
}

function errorCallback(error) {
  document.getElementById('coordinates-display').innerText = "Сигнал GPS отсутствует или доступ заблокирован.";
}

function saveLocation() {
  if (currentLatitude === null || currentLongitude === null) {
    alert("Сначала нажмите кнопку PIN!");
    return;
  }

  const noteInput = document.getElementById('note-input');
  const noteText = noteInput.value.trim() || "Без названия";

  // Убираем точки с запятой из текста заметки, чтобы не ломать CSV структуру
  const safeNote = noteText.replace(/;/g, ' ');

  const newLocation = {
    id: Date.now(),
    lat: currentLatitude,
    lng: currentLongitude,
    alt: currentAltitude !== null ? `${currentAltitude.toFixed(1)} м` : "не определена",
    note: safeNote,
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

// === 3. ЭКСПОРТ В CSV (ЧИСТЫЙ JS БЕЗ БИБЛИОТЕК) ===
function exportToCSV() {
  if (savedLocations.length === 0) {
    alert("Нет данных для сохранения!");
    return;
  }

  // Создаем заголовки колонок таблицы (разделяем точкой с запятой — стандарт для Excel)
  let csvContent = "Заметка;Широта;Долгота;Высота;Дата и время\r\n";

  // Заполняем строками
  savedLocations.forEach(loc => {
    csvContent += `${loc.note};${loc.lat};${loc.lng};${loc.alt};${loc.time}\r\n`;
  });

  // Добавляем BOM маркер (EF BB BF) в начало файла, чтобы Excel сразу понимал русский язык и UTF-8
  const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: "text/csv;charset=utf-8;" });
  
  // Создаем невидимую временную ссылку для скачивания файла
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "meore_locations.csv");
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click(); // Симулируем клик пользователя для старта скачивания
  document.body.removeChild(link);
}

// === 4. ИМПОРТ ИЗ CSV (КНОПКА LOAD) ===
function importFromCSV(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const text = e.target.result;
    
    // Разбиваем текст файла на строчки
    const lines = text.split(/\r?\n/);
    if (lines.length <= 1) {
      alert("Файл пуст.");
      return;
    }

    const newLocations = [];

    // Читаем со второй строчки (первая — это заголовки)
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue; // пропускаем пустые строки

      // Разделяем ячейки по точке с запятой
      const columns = lines[i].split(';');
      
      if (columns.length >= 4) {
        newLocations.push({
          id: Date.now() + i,
          note: columns[0] || "Импортировано",
          lat: parseFloat(columns[1]) || 0,
          lng: parseFloat(columns[2]) || 0,
          alt: columns[3] || "не определена",
          time: columns[4] || new Date().toLocaleString()
        });
      }
    }

    if (newLocations.length === 0) {
      alert("Не удалось распознать формат данных в файле.");
      return;
    }

    // Объединяем старые точки с новыми из файла
    savedLocations = savedLocations.concat(newLocations);
    localStorage.setItem('meore_locations', JSON.stringify(savedLocations));
    renderLocations();

    alert(`Успешно импортировано локаций: ${newLocations.length}`);
    event.target.value = ""; // Сбрасываем выбор файла
  };

  reader.readAsText(file, "UTF-8");
}
