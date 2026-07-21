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
