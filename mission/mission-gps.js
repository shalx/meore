// ======================================
// mission-gps.js
// GPS for Mission
// ======================================

const MissionGPS = {};

MissionGPS.watchId = null;

MissionGPS.lastPosition = null;


// ======================================
// START GPS
// ======================================

MissionGPS.start = function () {

    if (!navigator.geolocation) {

        alert("Geolocation is not supported.");

        return;

    }

    if (MissionGPS.watchId !== null) {

        return;

    }

    MissionGPS.watchId = navigator.geolocation.watchPosition(

        MissionGPS.success,

        MissionGPS.error,

        {

            enableHighAccuracy: true,

            timeout: 10000,

            maximumAge: 0

        }

    );

};


// ======================================
// STOP GPS
// ======================================

MissionGPS.stop = function () {

    if (MissionGPS.watchId === null) {

        return;

    }

    navigator.geolocation.clearWatch(

        MissionGPS.watchId

    );

    MissionGPS.watchId = null;

};


// ======================================
// SUCCESS
// ======================================

MissionGPS.success = function (position) {

    MissionGPS.lastPosition = position;

    const latitude = position.coords.latitude;

    const longitude = position.coords.longitude;

    const accuracy = position.coords.accuracy;

    Mission.checkPosition(

        latitude,

        longitude,

        accuracy

    );

    if (typeof MissionUI !== "undefined") {

        MissionUI.updateGps(

            latitude,

            longitude,

            accuracy

        );

    }

};


// ======================================
// ERROR
// ======================================

MissionGPS.error = function (error) {

    console.error(

        "GPS Error:",

        error.message

    );

};


// ======================================
// GET LAST POSITION
// ======================================

MissionGPS.getPosition = function () {

    return MissionGPS.lastPosition;

};


// ======================================
// IS RUNNING
// ======================================

MissionGPS.isRunning = function () {

    return MissionGPS.watchId !== null;

};


// ======================================
// RESTART
// ======================================

MissionGPS.restart = function () {

    MissionGPS.stop();

    MissionGPS.start();

};
