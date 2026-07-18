// =====================================
// MISSION
// =====================================

let missionRunning = false;


// =====================================

function startMission() {

    const selected =
        missionPoints.filter(p => p.selected);

    if (selected.length === 0) {

        alert("Select at least one point.");

        return;

    }

    missionRunning = true;

    saveMissionState();

    document.getElementById("start-btn").disabled = true;
    document.getElementById("stop-btn").disabled = false;

    console.log("Mission started.");

}


// =====================================

function stopMission() {

    missionRunning = false;

    saveMissionState();

    document.getElementById("start-btn").disabled = false;
    document.getElementById("stop-btn").disabled = true;

    console.log("Mission stopped.");

    stopMissionGPS();

}


// =====================================

function resetMission() {

    missionRunning = false;

    missionPoints.forEach(point => {

        point.selected = false;
        point.reached = false;
        point.reachedAt = null;

    });

    saveMissionState();

    renderMissionList();

    document.getElementById("start-btn").disabled = false;
    document.getElementById("stop-btn").disabled = true;

    console.log("Mission reset.");

}


// =====================================

function saveMissionState() {

    localStorage.setItem(
        "meore_mission",
        JSON.stringify({
            running: missionRunning,
            points: missionPoints
        })
    );

}


// =====================================

function loadMissionState() {

    const saved =
        JSON.parse(
            localStorage.getItem("meore_mission")
        );

    if (!saved)
        return;

    missionRunning = saved.running;

    if (saved.points)
        missionPoints = saved.points;

}


// =====================================

document.addEventListener("DOMContentLoaded", () => {

    loadMissionState();

    document
        .getElementById("start-btn")
        .addEventListener("click", startMission);

    document
        .getElementById("stop-btn")
        .addEventListener("click", stopMission);

    document
        .getElementById("reset-btn")
        .addEventListener("click", resetMission);

    document.getElementById("stop-btn").disabled = true;

});
startMissionGPS();
