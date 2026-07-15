const STORAGE_KEY = "meore_locations";

let currentLocation = null;
let savedLocations = loadLocations();

document.addEventListener("DOMContentLoaded", init);

function init() {
    document.getElementById("pin-btn").addEventListener("click", getLocation);
    document.getElementById("save-btn").addEventListener("click", saveLocation);
    document.getElementById("tracker-btn").addEventListener("click", openTracker);

    renderLocations();
}

function loadLocations() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
        return [];
    }
}

function saveLocations() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedLocations));
}

function getLocation() {

    const display = document.getElementById("coordinates-display");

    display.textContent = "Receiving GPS...";

    if (!navigator.geolocation) {
        display.textContent = "GPS is not supported.";
        return;
    }

    navigator.geolocation.getCurrentPosition(position => {

        currentLocation = {
            id: Date.now(),
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: Math.round(position.coords.accuracy),
            altitude: position.coords.altitude,
            time: new Date().toLocaleString()
        };

        display.textContent =
`Latitude : ${currentLocation.lat.toFixed(6)}
Longitude: ${currentLocation.lng.toFixed(6)}
Accuracy : ${currentLocation.accuracy} m
Altitude : ${currentLocation.altitude ?? "N/A"}
Time      : ${currentLocation.time}`;

    }, error => {

        display.textContent = error.message;

    }, {

        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0

    });
}

function saveLocation() {

    if (!currentLocation) {
        alert("Press PIN first.");
        return;
    }

    const note = document.getElementById("note-input").value.trim();

    savedLocations.unshift({
        ...currentLocation,
        note
    });

    saveLocations();

    document.getElementById("note-input").value = "";

    renderLocations();
}

function renderLocations() {

    const list = document.getElementById("locations-list");

    list.innerHTML = "";

    if (savedLocations.length === 0) {
        list.textContent = "No saved points.";
        return;
    }

    savedLocations.forEach(location => {

        const card = document.createElement("div");
        card.className = "location";

        card.innerHTML = `
<b>${location.note || "Without note"}</b>

<pre>
Lat: ${location.lat.toFixed(6)}
Lng: ${location.lng.toFixed(6)}
Accuracy: ${location.accuracy} m
Altitude: ${location.altitude ?? "N/A"}
${location.time}
</pre>

<div class="location-buttons">
<button>GO TO</button>
<button>DELETE</button>
</div>
`;

        const buttons = card.querySelectorAll("button");

        buttons[0].onclick = () =>
            window.open(
                `https://www.google.com/maps?q=${location.lat},${location.lng}`,
                "_blank"
            );

        buttons[1].onclick = () => {

            savedLocations =
                savedLocations.filter(x => x.id !== location.id);

            saveLocations();
            renderLocations();
        };

        list.appendChild(card);
    });
}

function openTracker() {
    window.location.href = "tracker.html";
}
