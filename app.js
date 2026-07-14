let currentLongitude = null;
let currentAltitude = null;

let tokenClient = null;
let accessToken = null;
const CLIENT_ID = '783371757942-u941c9rvsvna0c7sttr2nj9g0k2dcgei.apps.googleusercontent.com'; // ВСТАВЬТЕ СЮДА ВАШ ID ИЗ GOOGLE CONSOLE
const SCOPES = 'https://www.googleapis.com';


// Загружаем данные из памяти браузера (localStorage) или создаем пустой массив [1]
let savedLocations = JSON.parse(localStorage.getItem('meore_locations')) || [];

// Отрисовываем сохраненные точки при старте страницы
document.addEventListener("DOMContentLoaded", renderLocations);

// === ГЕОЛОКАЦИЯ ===
// === 1. ГЕОЛОКАЦИЯ ===
function getLocation() {
  const display = document.getElementById('coordinates-display');
  display.innerText = "Определяю местоположение...";
@@ -44,7 +40,7 @@ function errorCallback(error) {
  document.getElementById('coordinates-display').innerText = "Ошибка получения геопозиции.";
}

// === ЛОКАЛЬНОЕ СОХРАНЕНИЕ ===
// === 2. ЛОКАЛЬНОЕ СОХРАНЕНИЕ ===
function saveLocation() {
  if (currentLatitude === null || currentLongitude === null) {
    alert("Сначала нажмите кнопку PIN!");
@@ -64,7 +60,9 @@ function saveLocation() {
  };

  savedLocations.push(newLocation);
  // Сохраняем в localStorage [1]
  localStorage.setItem('meore_locations', JSON.stringify(savedLocations));
  
  renderLocations();
  noteInput.value = "";
}
@@ -98,79 +96,75 @@ function deleteLocation(id) {
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
// === 3. ЭКСПОРТ В EXCEL (СКАЧИВАНИЕ ФАЙЛА) ===
function exportToExcel() {
  if (savedLocations.length === 0) {
    alert("Нет данных для сохранения в Excel!");
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
// === 4. ИМПОРТ ИЗ EXCEL (КНОПКА LOAD) ===
function importFromExcel(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });

    if (response.ok) {
      alert('Успешно! Локации синхронизированы с Google Диском.');
    } else {
      alert('Ошибка API. Убедитесь, что правильно указали Client ID в коде app.js.');
    // Читаем первую вкладку Excel-файла [1]
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Превращаем строки Excel обратно в массив объектов JavaScript [1]
    const importedRows = XLSX.utils.sheet_to_json(worksheet);

    if (importedRows.length === 0) {
      alert("Выбранный файл пуст или имеет неверный формат.");
      return;
    }
  } catch (error) {
    alert('Ошибка сети при отправке данных.');
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
