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
// ======================================
// SHOW REACHED
// ======================================

MissionUI.showReached = function (pointId) {

    const point = Mission.getPoint(pointId);

    if (!point) return;

    MissionUI.showMessage(

        "✅ " +

        point.note +

        " reached"

    );

};


// ======================================
// SHOW COMPLETED
// ======================================

MissionUI.showCompleted = function () {

    const duration = MissionUtils.formatDuration(

        Mission.getDuration()

    );

    MissionUI.showMessage(

        "🎉 MISSION COMPLETED<br><br>" +

        "Duration: " +

        duration

    );

    MissionUI.setStatus(

        "Completed"

    );

    MissionUI.update();

};


// ======================================
// SHOW MESSAGE
// ======================================

MissionUI.showMessage = function (text) {

    if (!MissionUI.elements.message) return;

    MissionUI.elements.message.innerHTML = text;

    MissionUI.elements.message.style.display = "block";

    clearTimeout(

        MissionUI.messageTimer

    );

    MissionUI.messageTimer = setTimeout(

        MissionUI.clearMessage,

        3000

    );

};


// ======================================
// CLEAR MESSAGE
// ======================================

MissionUI.clearMessage = function () {

    if (!MissionUI.elements.message) return;

    MissionUI.elements.message.innerHTML = "";

    MissionUI.elements.message.style.display = "none";

};


// ======================================
// STATUS
// ======================================

MissionUI.setStatus = function (text) {

    if (!MissionUI.elements.status) return;

    MissionUI.elements.status.innerHTML = text;

};


// ======================================
// EMPTY
// ======================================

MissionUI.showEmptyMission = function () {

    if (!MissionUI.elements.points) return;

    MissionUI.elements.points.innerHTML =

        "<p>No active mission.</p>";

    MissionUI.updateProgress();

};


// ======================================
// RESET UI
// ======================================

MissionUI.reset = function () {

    MissionUI.clearMessage();

    MissionUI.showEmptyMission();

    MissionUI.setStatus("Ready");

    if (MissionUI.elements.gps) {

        MissionUI.elements.gps.innerHTML = "";

    }

};


// ======================================
// REFRESH
// ======================================

MissionUI.refresh = function () {

    if (Mission.getTotalPoints() === 0) {

        MissionUI.showEmptyMission();

        return;

    }

    MissionUI.update();

};
