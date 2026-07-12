function getLocation() {
  const display = document.getElementById('coordinates-display');
  display.innerText = "Определяю местоположение...";

  // Настройки для получения максимально точных данных (включая высоту)
  const options = {
    enableHighAccuracy: true, // Включает GPS на смартфонах для высокой точности
    timeout: 10000,           // Ждать ответ не более 10 секунд
    maximumAge: 0             // Не использовать старые кэшированные данные
  };

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);
  } else {
    display.innerText = "Геолокация не поддерживается вашим браузером.";
  }
}

function successCallback(position) {
  const display = document.getElementById('coordinates-display');
  
  const latitude = position.coords.latitude;   // Широта
  const longitude = position.coords.longitude; // Долгота
  const altitude = position.coords.altitude;   // Высота над уровнем моря
  
  // Высота может быть null, если устройство (например, старый ПК) не умеет её определять
  let altitudeText = "не определена (нужен GPS/смартфон)";
  if (altitude !== null) {
    altitudeText = `${altitude.toFixed(1)} метров`;
  }

  // Выводим данные на экран
  display.innerHTML = `
    <strong>Широта (Latitude):</strong> ${latitude}<br>
    <strong>Долгота (Longitude):</strong> ${longitude}<br>
    <strong>Высота над уровнем моря:</strong> ${altitudeText}
  `;
}

function errorCallback(error) {
  const display = document.getElementById('coordinates-display');
  
  switch(error.code) {
    case error.PERMISSION_DENIED:
      display.innerText = "Ошибка: Вы запретили доступ к геолокации в браузере.";
      break;
    case error.POSITION_UNAVAILABLE:
      display.innerText = "Ошибка: Не удалось определить координаты (нет связи со спутниками/сетью).";
      break;
    case error.TIMEOUT:
      display.innerText = "Ошибка: Время ожидания запроса истекло.";
      break;
    default:
      display.innerText = "Произошла неизвестная ошибка при получении геопозиции.";
      break;
  }
}
