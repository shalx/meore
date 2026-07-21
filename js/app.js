"use strict";

/*
=========================================
MEORE FREE
app.js
Главный экран
=========================================
*/


// =====================================
// GLOBAL
// =====================================

let currentLocation = null;


// =====================================
// START
// =====================================

document.addEventListener(
    "DOMContentLoaded",
    init
);


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

    if (!navigator.geolocation) {

        showStatus(
            "Geolocation is not supported.",
            true
        );

        return;
    }

    showStatus("Receiving GPS...");

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

    currentLocation = {

        latitude:
            position.coords.latitude,

        longitude:
            position.coords.longitude,

        accuracy:
            position.coords.accuracy,

        time:
            new Date(
                position.timestamp
            ).toISOString()

    };


    displayCoordinates();

    showStatus("GPS received.");

}


// =====================================
// GPS ERROR
// =====================================

function locationError(error) {

    let message =
        "GPS error.";

    switch (error.code) {

        case error.PERMISSION_DENIED:

            message =
                "Permission denied.";

            break;

        case error.POSITION_UNAVAILABLE:

            message =
                "Location unavailable.";

            break;

        case error.TIMEOUT:

            message =
                "GPS timeout.";

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

        Math.round(
            currentLocation.accuracy
        ) + " m"

    );


    setText(

        "time-value",

        new Date(
            currentLocation.time
        ).toLocaleString()

    );

}
// =====================================
// SAVE LOCATION
// =====================================

function saveLocation() {

    const noteInput =
        document.getElementById("note-input");

    if (!currentLocation) {

        showStatus(
            "Сначала нажмите PIN.",
            true
        );

        return;
    }

    if (
        typeof Storage === "undefined" ||
        typeof Storage.save !== "function"
    ) {

        showStatus(
            "Storage не подключён.",
            true
        );

        return;
    }

    const note = noteInput
        ? noteInput.value.trim()
        : "";

    const savedLocation = Storage.save({

        note,

        latitude: currentLocation.latitude,

        longitude: currentLocation.longitude,

        accuracy: currentLocation.accuracy,

        time: currentLocation.time

    });

    if (!savedLocation) {

        showStatus(
            "Не удалось сохранить точку.",
            true
        );

        return;
    }

    if (noteInput) {
        noteInput.value = "";
    }

    currentLocation = null;

    clearCoordinates();

    showStatus("Точка сохранена.");

}


// =====================================
// OPEN SAVED POINTS
// =====================================

function openSavedPoints() {

    window.location.href = "saved.html";

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
