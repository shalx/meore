"use strict";


// =====================================
// MEORE FREE
// Главный экран
// Получение и сохранение GPS-точек
// =====================================


// Ключ для хранения точек в localStorage
const STORAGE_KEY = "meore_locations";


// Последняя полученная GPS-точка
let currentLocation = null;


// =====================================
// ЗАПУСК ПРИЛОЖЕНИЯ
// =====================================

document.addEventListener("DOMContentLoaded", init);


function init() {

    const pinButton = document.getElementById("pin-btn");
    const saveButton = document.getElementById("save-btn");
    const savedPointsButton = document.getElementById("saved-points-btn");
    const noteInput = document.getElementById("note-input");


    if (pinButton) {
        pinButton.addEventListener("click", getLocation);
    }


    if (saveButton) {
        saveButton.addEventListener("click", saveLocation);
    }


    if (savedPointsButton) {
        savedPointsButton.addEventListener("click", openSavedPoints);
    }


    if (noteInput) {

        noteInput.addEventListener("keydown", event => {

            if (event.key === "Enter") {

                event.preventDefault();

                if (currentLocation) {
                    saveLocation();
                }
            }
        });
    }


    registerServiceWorker();
}


// =====================================
// ПОЛУЧЕНИЕ GPS-КООРДИНАТ
// =====================================

function getLocation() {

    const pinButton = document.getElementById("pin-btn");
    const saveButton = document.getElementById("save-btn");


    if (!navigator.geolocation) {

        showStatus(
            "Геолокация не поддерживается этим устройством",
            true
        );

        return;
    }


    currentLocation = null;

    clearCoordinates();


    if (pinButton) {

        pinButton.disabled = true;
        pinButton.textContent = "RECEIVING GPS...";
    }


    if (saveButton) {
        saveButton.disabled = true;
    }


    showStatus("Получаем координаты...");


    const options = {

        enableHighAccuracy: true,

        timeout: 20000,

        maximumAge: 0
    };


    navigator.geolocation.getCurrentPosition(

        handleLocationSuccess,

        handleLocationError,

        options
    );
}


// =====================================
// GPS ПОЛУЧЕН УСПЕШНО
// =====================================

function handleLocationSuccess(position) {

    const pinButton = document.getElementById("pin-btn");
    const saveButton = document.getElementById("save-btn");


    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const accuracy = position.coords.accuracy;


    currentLocation = {

        latitude: latitude,

        longitude: longitude,

        accuracy: Number.isFinite(accuracy)
            ? accuracy
            : null,

        time: new Date(position.timestamp).toISOString()
    };


    displayCoordinates(currentLocation);


    if (pinButton) {

        pinButton.disabled = false;
        pinButton.textContent = "PIN";
    }


    if (saveButton) {
        saveButton.disabled = false;
    }


    showStatus("Координаты получены");
}


// =====================================
// ОШИБКА GPS
// =====================================

function handleLocationError(error) {

    const pinButton = document.getElementById("pin-btn");
    const saveButton = document.getElementById("save-btn");


    currentLocation = null;


    if (pinButton) {

        pinButton.disabled = false;
        pinButton.textContent = "PIN";
    }


    if (saveButton) {
        saveButton.disabled = true;
    }


    let message;


    switch (error.code) {

        case error.PERMISSION_DENIED:

            message =
                "Доступ к геолокации запрещён. Разрешите доступ в настройках браузера.";

            break;


        case error.POSITION_UNAVAILABLE:

            message =
                "Не удалось определить местоположение. Проверьте GPS.";

            break;


        case error.TIMEOUT:

            message =
                "Время ожидания GPS истекло. Попробуйте ещё раз.";

            break;


        default:

            message =
                "Произошла ошибка при получении координат.";
    }


    showStatus(message, true);
}


// =====================================
// ОТОБРАЖЕНИЕ КООРДИНАТ
// =====================================

function displayCoordinates(location) {

    setText(
        "latitude-value",
        formatCoordinate(location.latitude)
    );


    setText(
        "longitude-value",
        formatCoordinate(location.longitude)
    );


    setText(
        "accuracy-value",
        formatAccuracy(location.accuracy)
    );


    setText(
        "time-value",
        formatDateTime(location.time)
    );
}


// =====================================
// ОЧИСТКА КООРДИНАТ НА ЭКРАНЕ
// =====================================

function clearCoordinates() {

    setText("latitude-value", "—");

    setText("longitude-value", "—");

    setText("accuracy-value", "—");

    setText("time-value", "—");
}


// =====================================
// СОХРАНЕНИЕ ТОЧКИ
// =====================================

function saveLocation() {

    const noteInput = document.getElementById("note-input");
    const saveButton = document.getElementById("save-btn");


    if (!currentLocation) {

        showStatus(
            "Сначала нажмите PIN и получите координаты",
            true
        );

        return;
    }


    const note = noteInput
        ? noteInput.value.trim()
        : "";


    const savedLocations = loadLocations();


    const newLocation = {

        id: createLocationId(),

        note: note,

        latitude: currentLocation.latitude,

        longitude: currentLocation.longitude,

        accuracy: currentLocation.accuracy,

        time: currentLocation.time,

        savedAt: new Date().toISOString()
    };


    savedLocations.push(newLocation);


    const savedSuccessfully = storeLocations(savedLocations);


    if (!savedSuccessfully) {
        return;
    }


    if (noteInput) {
        noteInput.value = "";
    }


    currentLocation = null;

    clearCoordinates();


    if (saveButton) {
        saveButton.disabled = true;
    }


    showStatus("Точка сохранена");


    /*
    Позже здесь подключим автоматическое
    обновление резервной копии Google Drive.

    Например:

    syncWithGoogleDrive(savedLocations);
    */
}


// =====================================
// ЗАГРУЗКА ТОЧЕК ИЗ LOCALSTORAGE
// =====================================

function loadLocations() {

    try {

        const storedData = localStorage.getItem(STORAGE_KEY);


        if (!storedData) {
            return [];
        }


        const parsedData = JSON.parse(storedData);


        if (!Array.isArray(parsedData)) {
            return [];
        }


        return parsedData;

    } catch (error) {

        console.error(
            "Ошибка чтения сохранённых точек:",
            error
        );

        return [];
    }
}


// =====================================
// СОХРАНЕНИЕ ТОЧЕК В LOCALSTORAGE
// =====================================

function storeLocations(locations) {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(locations)
        );


        return true;

    } catch (error) {

        console.error(
            "Ошибка сохранения точки:",
            error
        );


        showStatus(
            "Не удалось сохранить точку",
            true
        );


        return false;
    }
}


// =====================================
// ОТКРЫТИЕ SAVED POINTS
// =====================================

function openSavedPoints() {

    window.location.href = "saved.html";
}


// =====================================
// УНИКАЛЬНЫЙ ID ТОЧКИ
// =====================================

function createLocationId() {

    if (
        window.crypto &&
        typeof window.crypto.randomUUID === "function"
    ) {

        return window.crypto.randomUUID();
    }


    return (
        Date.now().toString(36) +
        "-" +
        Math.random().toString(36).slice(2)
    );
}


// =====================================
// ФОРМАТ КООРДИНАТ
// =====================================

function formatCoordinate(value) {

    if (!Number.isFinite(value)) {
        return "—";
    }


    return value.toFixed(6);
}


// =====================================
// ФОРМАТ ТОЧНОСТИ
// =====================================

function formatAccuracy(value) {

    if (!Number.isFinite(value)) {
        return "Недоступно";
    }


    return `${Math.round(value)} m`;
}


// =====================================
// ФОРМАТ ДАТЫ И ВРЕМЕНИ
// =====================================

function formatDateTime(value) {

    const date = new Date(value);


    if (Number.isNaN(date.getTime())) {
        return "—";
    }


    return date.toLocaleString("ru-RU");
}


// =====================================
// ИЗМЕНЕНИЕ ТЕКСТА ЭЛЕМЕНТА
// =====================================

function setText(elementId, value) {

    const element = document.getElementById(elementId);


    if (element) {
        element.textContent = value;
    }
}


// =====================================
// СТАТУС ПРИЛОЖЕНИЯ
// =====================================

function showStatus(message, isError = false) {

    const statusElement =
        document.getElementById("status-message");


    if (!statusElement) {
        return;
    }


    statusElement.textContent = message;


    if (isError) {

        statusElement.classList.add("error");

    } else {

        statusElement.classList.remove("error");
    }
}


// =====================================
// SERVICE WORKER
// =====================================

function registerServiceWorker() {

    if (!("serviceWorker" in navigator)) {
        return;
    }


    window.addEventListener("load", () => {

        navigator.serviceWorker
            .register("sw.js")
            .catch(error => {

                console.error(
                    "Ошибка регистрации Service Worker:",
                    error
                );
            });
    });
}
