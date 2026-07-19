// ======================================
// mission-ui.js
// Mission User Interface
// ======================================

const MissionUI = {};

MissionUI.elements = {};


// ======================================
// INIT
// ======================================

MissionUI.init = function () {

    MissionUI.elements.points =
        document.getElementById("mission-points");

    MissionUI.elements.progress =
        document.getElementById("mission-progress");

    MissionUI.elements.status =
        document.getElementById("mission-status");

    MissionUI.elements.gps =
        document.getElementById("mission-gps");

    MissionUI.elements.message =
        document.getElementById("mission-message");

};


// ======================================
// UPDATE
// ======================================

MissionUI.update = function () {

    MissionUI.updateProgress();

    MissionUI.renderPoints();

};


// ======================================
// PROGRESS
// ======================================

MissionUI.updateProgress = function () {

    const progress = Mission.getProgress();

    if (!MissionUI.elements.progress) return;

    MissionUI.elements.progress.innerHTML =

        progress.reached +

        " / " +

        progress.total +

        " (" +

        progress.percent +

        "%)";

};


// ======================================
// RENDER POINTS
// ======================================

MissionUI.renderPoints = function () {

    const container = MissionUI.elements.points;

    if (!container) return;

    container.innerHTML = "";

    const points = Mission.getPoints();

    for (const point of points) {

        const row = document.createElement("div");

        row.className = "mission-row";

        const status = point.reached

            ? "✅"

            : "⭕";

        row.innerHTML =

            "<span>" +

            status +

            "</span> " +

            point.note;

        container.appendChild(row);

    }

};


// ======================================
// GPS
// ======================================

MissionUI.updateGps = function (

    lat,

    lng,

    accuracy

) {

    if (!MissionUI.elements.gps) return;

    MissionUI.elements.gps.innerHTML =

        "Lat: " +

        lat.toFixed(6) +

        "<br>" +

        "Lng: " +

        lng.toFixed(6) +

        "<br>" +

        "Accuracy: " +

        Math.round(accuracy) +

        " m";

};
