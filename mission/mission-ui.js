// =====================================
// MISSION UI
// =====================================

let missionPoints = [];

function loadMissionPoints() {

    const list = document.getElementById("mission-list");

    missionPoints =
        JSON.parse(localStorage.getItem("meore_locations")) || [];

    if (missionPoints.length === 0) {

        list.innerHTML = `
            <p>No saved locations.</p>
        `;

        updateProgress();

        return;
    }

    renderMissionList();
}


// =====================================

function renderMissionList() {

    const list = document.getElementById("mission-list");

    list.innerHTML = "";

    missionPoints.forEach((point, index) => {

        if (point.selected === undefined)
            point.selected = false;

        if (point.reached === undefined)
            point.reached = false;

        const card = document.createElement("div");

        card.className = "mission-card";

        card.innerHTML = `

<label>

<input
type="checkbox"
${point.selected ? "checked" : ""}
onchange="toggleMission(${index}, this.checked)">

<b>${point.note || "Point " + (index + 1)}</b>

</label>

<br><br>

Latitude:
${point.lat}

<br>

Longitude:
${point.lng}

<br><br>

Status:
<span id="status-${index}">

${point.reached ? "✅ REACHED" : "NOT STARTED"}

</span>

<hr>

`;

        list.appendChild(card);

    });

    updateProgress();

}


// =====================================

function toggleMission(index, checked) {

    missionPoints[index].selected = checked;

    updateProgress();

}


// =====================================

function updateProgress() {

    const total =
        missionPoints.filter(p => p.selected).length;

    const reached =
        missionPoints.filter(
            p => p.selected && p.reached
        ).length;

    document.getElementById("progress-text").innerHTML =
        `${reached} / ${total} Completed`;

}


// =====================================

document.addEventListener("DOMContentLoaded", () => {

    loadMissionPoints();

});
