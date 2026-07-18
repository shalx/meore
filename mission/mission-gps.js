// =====================================
// MISSION GPS
// =====================================

const MISSION_RADIUS = 70;      // meters
const GPS_INTERVAL = 5000;      // 5 sec

let gpsTimer = null;


// =====================================

function startMissionGPS() {

    if (gpsTimer)
        clearInterval(gpsTimer);

    checkMission();

    gpsTimer = setInterval(checkMission, GPS_INTERVAL);

}


// =====================================

function stopMissionGPS() {

    if (gpsTimer) {

        clearInterval(gpsTimer);

        gpsTimer = null;

    }

}


// =====================================

function checkMission() {

    if (!missionRunning)
        return;

    navigator.geolocation.getCurrentPosition(

        position => {

            const myLat = position.coords.latitude;
            const myLng = position.coords.longitude;

            missionPoints.forEach((point, index) => {

                if (!point.selected)
                    return;

                if (point.reached)
                    return;

                const distance = getDistance(

                    myLat,
                    myLng,

                    point.lat,
                    point.lng

                );

                if (distance <= MISSION_RADIUS) {

                    point.reached = true;
                    point.reachedAt =
                        new Date().toLocaleString();

                    const status =
                        document.getElementById(
                            "status-" + index
                        );

                    if (status)
                        status.innerHTML =
                            "✅ REACHED";

                    saveMissionState();

                    updateProgress();

                }

            });

            checkMissionCompleted();

        },

        error => {

            console.log(error);

        },

        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 10000
        }

    );

}


// =====================================

function checkMissionCompleted() {

    const selected =
        missionPoints.filter(p => p.selected);

    const reached =
        selected.filter(p => p.reached);

    if (
        selected.length > 0 &&
        reached.length === selected.length
    ) {

        stopMission();

        alert("MISSION COMPLETE");

    }

}


// =====================================

function getDistance(
    lat1,
    lon1,
    lat2,
    lon2
) {

    const R = 6371000;

    const dLat =
        (lat2 - lat1) * Math.PI / 180;

    const dLon =
        (lon2 - lon1) * Math.PI / 180;

    const a =

        Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +

        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *

        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c =
        2 * Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return R * c;

}
