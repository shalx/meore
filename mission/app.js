// ======================================
// app.js
// Mission Application
// ======================================

document.addEventListener("DOMContentLoaded", initMission);


// ======================================
// INIT
// ======================================

function initMission() {

    MissionUI.init();

    Mission.init();

    MissionUI.refresh();

    bindButtons();

    if (Mission.isActive()) {

        MissionGPS.start();

        MissionUI.setStatus("Mission running");

    } else if (Mission.isCompleted()) {

        MissionUI.setStatus("Mission completed");

    } else {

        MissionUI.setStatus("Ready");

    }

}


// ======================================
// BUTTONS
// ======================================

function bindButtons() {

    const startBtn = document.getElementById("start-btn");
    const stopBtn = document.getElementById("stop-btn");
    const resetBtn = document.getElementById("reset-btn");

    if (startBtn) {

        startBtn.addEventListener("click", startMission);

    }

    if (stopBtn) {

        stopBtn.addEventListener("click", stopMission);

    }

    if (resetBtn) {

        resetBtn.addEventListener("click", resetMission);

    }

}


// ======================================
// START
// ======================================

function startMission() {

    // TODO:
    // zdes' budut vybrannye pol'zovatelem tochki.
    // Poka dlja testa berem global'nyj massiv.

    if (typeof savedLocations === "undefined") {

        alert("No saved locations.");

        return;

    }

    if (savedLocations.length === 0) {

        alert("No saved locations.");

        return;

    }

    Mission.start(savedLocations);

    MissionUI.refresh();

    MissionUI.setStatus("Mission running");

    MissionGPS.start();

}


// ======================================
// STOP
// ======================================

function stopMission() {

    Mission.stop();

    MissionGPS.stop();

    MissionUI.setStatus("Mission stopped");

}


// ======================================
// RESET
// ======================================

function resetMission() {

    if (!confirm("Reset mission?")) {

        return;

    }

    MissionGPS.stop();

    Mission.reset();

    MissionUI.reset();

}


// ======================================
// RESUME
// ======================================

function resumeMission() {

    Mission.resume();

    MissionGPS.start();

    MissionUI.refresh();

    MissionUI.setStatus("Mission running");

}
