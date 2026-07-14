// ===============================
// MEORE APP.JS
// Offline + LocalStorage + CSV
// ===============================

let currentLatitude = null;
let currentLongitude = null;
let currentAltitude = null;

let savedLocations =
    JSON.parse(localStorage.getItem("meore_locations")) || [];

document.addEventListener("DOMContentLoaded", () => {
    renderLocations();
});

// ===============================
// GPS
// ===============================

function getLocation() {

    const display = document.getElementById("coordinates-display");

    if (!navigator.geolocation) {
        display.innerText = "Геолокация не поддерживается.";
        return;
    }

    display.innerText = "Получение координат...";

    navigator.geolocation.getCurrentPosition(
        successCallback,
        errorCallback,
        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        }
    );

}

function successCallback(position) {

    currentLatitude = position.coords.latitude;
    currentLongitude = position.coords.longitude;
    currentAltitude = position.coords.altitude;

    document.getElementById("coordinates-display").innerHTML =
        "Latitude : " + currentLatitude + "<br>" +
        "Longitude: " + currentLongitude + "<br>" +
        "Altitude : " +
        (currentAltitude === null ? "N/A" : currentAltitude);

}

function errorCallback(error) {

    let text = "Ошибка GPS";

    switch (error.code) {

        case error.PERMISSION_DENIED:
            text = "Разрешите доступ к геолокации.";
            break;

        case error.POSITION_UNAVAILABLE:
            text = "GPS недоступен.";
            break;

        case error.TIMEOUT:
            text = "Истекло время ожидания.";
            break;

    }

    document.getElementById("coordinates-display").innerText = text;

}

// ===============================
// SAVE
// ===============================

function saveLocation() {

    if (currentLatitude === null) {

        alert("Сначала нажмите PIN.");

        return;

    }

    const noteInput = document.getElementById("note-input");

    const item = {

        id: Date.now(),

        lat: currentLatitude,

        lng: currentLongitude,

        alt: currentAltitude,

        note: noteInput.value.trim(),

        time: new Date().toLocaleString()

    };

    savedLocations.push(item);

    localStorage.setItem(
        "meore_locations",
        JSON.stringify(savedLocations)
    );

    noteInput.value = "";

    renderLocations();

}

// ===============================
// LIST
// ===============================

function renderLocations() {

    const list = document.getElementById("locations-list");

    if (savedLocations.length === 0) {

        list.innerHTML = "Список пуст.";

        return;

    }

    let html = "";

    savedLocations.forEach(loc => {

        html +=
        `<div>

        <b>${loc.note || "Без заметки"}</b><br>

        ${loc.lat}<br>

        ${loc.lng}<br>

        ${loc.alt === null ? "N/A" : loc.alt}<br>

        ${loc.time}<br>

        <button onclick="deleteLocation(${loc.id})">

        DELETE

        </button>

        <hr>

        </div>`;

    });

    list.innerHTML = html;

}

function deleteLocation(id) {

    savedLocations =
        savedLocations.filter(x => x.id !== id);

    localStorage.setItem(
        "meore_locations",
        JSON.stringify(savedLocations)
    );

    renderLocations();

}

// ===============================
// EXPORT CSV
// ===============================

function exportToCSV() {

    if (savedLocations.length === 0) {

        alert("Нет данных.");

        return;

    }

    let csv =

"Note,Latitude,Longitude,Altitude,Time\n";

    savedLocations.forEach(loc => {

        csv += `"${loc.note}",${loc.lat},${loc.lng},${loc.alt},"${loc.time}"\n`;

    });

    const blob = new Blob(
        [csv],
        {
            type: "text/csv;charset=utf-8;"
        }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = "meore_locations.csv";

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);

    URL.revokeObjectURL(url);

}

// ===============================
// IMPORT CSV
// ===============================

function importFromCSV(event) {

    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(e) {

        const rows =
            e.target.result.trim().split("\n");

        if (rows.length < 2) {

            alert("CSV пуст.");

            return;

        }

        rows.shift();

        rows.forEach(line => {

            const cols =
                line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);

            if (!cols || cols.length < 5) return;

            savedLocations.push({

                id: Date.now() + Math.random(),

                note: cols[0].replace(/"/g, ""),

                lat: parseFloat(cols[1]),

                lng: parseFloat(cols[2]),

                alt: cols[3] === "null"
                    ? null
                    : parseFloat(cols[3]),

                time: cols[4].replace(/"/g, "")

            });

        });

        localStorage.setItem(
            "meore_locations",
            JSON.stringify(savedLocations)
        );

        renderLocations();

        alert("Импорт завершен.");

        event.target.value = "";

    };

    reader.readAsText(file);

}
