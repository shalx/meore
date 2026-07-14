// === ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ===
let currentLatitude = null;
let currentLongitude = null;
let currentAltitude = null;

// Загружаем данные из памяти браузера (localStorage) или создаем пустой массив [1]
let savedLocations = JSON.parse(localStorage.getItem('meore_locations')) || [];

// Отрисовываем сохраненные точки при старте страницы
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

// === 2. ЛОКАЛЬНОЕ СОХРАНЕНИЕ ===
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
  // Сохраняем в localStorage [1]
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

// === 3. ЭКСПОРТ В EXCEL (СКАЧИВАНИЕ ФАЙЛА) ===
function exportToExcel() {
  if (savedLocations.length === 0) {
    alert("Нет данных для сохранения в Excel!");
    return;
  }

  // Форматируем данные в красивую таблицу для Excel [1]
  const excelData = savedLocations.map(loc => ({
    "Заметка (Note)": loc.note,
    "Широта (Latitude)": loc.lat,
    "Долгота (Longitude)": loc.lng,
    "Высота (Altitude)": loc.alt,
    "Дата и время": loc.time
  }));

  // Создаем рабочую книгу Excel при помощи библиотеки SheetJS [1]
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Locations");

  // Скачиваем готовый файл на компьютер или телефон [1]
  XLSX.writeFile(workbook, "meore_locations.xlsx");
}

// === 4. ИМПОРТ ИЗ EXCEL (КНОПКА LOAD) ===
function importFromExcel(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    
    // Читаем первую вкладку Excel-файла [1]
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Превращаем строки Excel обратно в массив объектов JavaScript [1]
    const importedRows = XLSX.utils.sheet_to_json(worksheet);

    if (importedRows.length === 0) {
      alert("Выбранный файл пуст или имеет неверный формат.");
      return;
    }

    // Преобразуем формат Excel обратно в структуру нашего приложения [1]
    const newLocations = importedRows.map((row, index) => ({
      id: Date.now() + index, // генерируем новый уникальный ID [1]
      lat: row["Широта (Latitude)"] || 0,
      lng: row["Долгота (Longitude)"] || 0,
      alt: row["Высота (Altitude)"] || "не определена",
      note: row["Заметка (Note)"] || "Импортировано",
      time: row["Дата и время"] || new Date().toLocaleString()
    }));

    // Объединяем старые локации с новыми из файла [1]
    savedLocations = savedLocations.concat(newLocations);
    
    // Сохраняем объединенный результат в localStorage и обновляем экран [1]
    localStorage.setItem('meore_locations', JSON.stringify(savedLocations));
    renderLocations();

    alert(`Успешно импортировано точек: ${newLocations.length}`);
    
    // Сбрасываем поле выбора файла, чтобы можно было загрузить его повторно
    event.target.value = "";
  };
  
  reader.readAsArrayBuffer(file);
}
