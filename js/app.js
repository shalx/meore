"use strict";

/*
=========================================
MEORE FREE
app.js
Главный экран
=========================================
*/

let currentLocation = null;


// =====================================
// START
// =====================================

document.addEventListener("DOMContentLoaded", init);


function init() {

    const pinBtn =
        document.getElementById("pin-btn");

    const saveBtn =
        document.getElementById("save-btn");

    const savedBtn =
        document.getElementById("saved-points-btn");


    if (pinBtn) {
        pinBtn.addEventListener(
            "click",
            getLocation
        );
    }


    if (saveBtn) {

        saveBtn.addEventListener(
            "click",
            saveLocation
        );

        saveBtn.disabled = true;
    }


    if (savedBtn) {
        savedBtn.addEventListener(
            "click",
            openSavedPoints
        );
    }


    registerServiceWorker();
}


// =====================================
// GPS
// =====================================

function getLocation() {

    const pinBtn =
        document.getElementById("pin-btn");

    const saveBtn =
        document.getElementById("save-btn");


    if (!navigator.geolocation) {

        showStatus(
            "Геолокация не поддерживается.",
            true
        );

        return;
    }


    currentLocation = null;

    clearCoordinates();


    if (pinBtn) {

        pinBtn.disabled = true;

        pinBtn.textContent =
            "RECEIVING GPS...";
    }


    if (saveBtn) {
        saveBtn.disabled = true;
    }


    showStatus("Получаем координаты...");


    navigator.geolocation.getCurrentPosition(

        locationSuccess,

        locationError,

        {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0
        }
    );
}


// =====================================
// GPS SUCCESS
// =====================================

function locationSuccess(position) {

    const pinBtn =
        document.getElementById("pin-btn");

    const saveBtn =
        document.getElementById("save-btn");


    currentLocation = {

        latitude:
            position.coords.latitude,

        longitude:
            position.coords.longitude,

        accuracy:
            Number.isFinite(
                position.coords.accuracy
            )
                ? position.coords.accuracy
                : null,

        time:
            new Date(
                position.timestamp
            ).toISOString()
    };


    displayCoordinates();


    if (pinBtn) {

        pinBtn.disabled = false;

        pinBtn.textContent = "PIN";
    }


    if (saveBtn) {
        saveBtn.disabled = false;
    }


    showStatus("Координаты получены.");
}


// =====================================
// GPS ERROR
// =====================================

function locationError(error) {

    const pinBtn =
        document.getElementById("pin-btn");

    const saveBtn =
        document.getElementById("save-btn");


    currentLocation = null;


    if (pinBtn) {

        pinBtn.disabled = false;

        pinBtn.textContent = "PIN";
    }


    if (saveBtn) {
        saveBtn.disabled = true;
    }


    let message =
        "Ошибка получения GPS.";


    switch (error.code) {

        case error.PERMISSION_DENIED:

            message =
                "Доступ к геолокации запрещён.";

            break;


        case error.POSITION_UNAVAILABLE:

            message =
                "Местоположение недоступно.";

            break;


        case error.TIMEOUT:

            message =
                "Время ожидания GPS истекло.";

            break;
    }


    showStatus(
        message,
        true
    );
}


// =====================================
// DISPLAY GPS
// =====================================

function displayCoordinates() {

    if (!currentLocation) {
        return;
    }


    setText(
        "latitude-value",
        currentLocation.latitude.toFixed(6)
    );


    setText(
        "longitude-value",
        currentLocation.longitude.toFixed(6)
    );


    setText(
        "accuracy-value",
        Number.isFinite(
            currentLocation.accuracy
        )
            ? Math.round(
                currentLocation.accuracy
            ) + " m"
            : "—"
    );


    setText(
        "time-value",
        new Date(
            currentLocation.time
        ).toLocaleString("ru-RU")
    );
}


// =====================================
// SAVE LOCATION
// =====================================

function saveLocation() {

    // проверки координат и NOTE...

    locations.push(newLocation);

    localStorage.setItem(
        "meore_locations",
        JSON.stringify(locations)
    );

    backupToDrive().catch(error => {

        console.error(
            "Автоматический backup не выполнен:",
            error
        );

    });

    alert("Точка сохранена.");

}


// =====================================
// OPEN SAVED POINTS
// =====================================

function openSavedPoints() {

    window.location.href =
        "saved.html";
}


// =====================================
// CLEAR COORDINATES
// =====================================

function clearCoordinates() {

    setText(
        "latitude-value",
        "—"
    );

    setText(
        "longitude-value",
        "—"
    );

    setText(
        "accuracy-value",
        "—"
    );

    setText(
        "time-value",
        "—"
    );
}


// =====================================
// STATUS MESSAGE
// =====================================

function showStatus(
    message,
    isError = false
) {

    const status =
        document.getElementById(
            "status-message"
        );


    if (!status) {
        return;
    }


    status.textContent = message;


    if (isError) {

        status.classList.add("error");

    } else {

        status.classList.remove("error");
    }
}


// =====================================
// SET TEXT
// =====================================

function setText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (element) {
        element.textContent = value;
    }
}


// =====================================
// SERVICE WORKER
// =====================================

function registerServiceWorker() {

    if (
        !("serviceWorker" in navigator)
    ) {
        return;
    }


    window.addEventListener(
        "load",
        () => {

            navigator.serviceWorker
                .register("sw.js")
                .catch(error => {

                    console.error(
                        "Service Worker error:",
                        error
                    );
                });
        }
    );
}
