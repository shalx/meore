```javascript
// =====================================
// MEORE v2.1 PRO
// GPS + Altitude + Address + Weather
// =====================================

const STORAGE_KEY = "meore_locations";

let currentData = null;
let savedLocations = loadLocations();

document.addEventListener("DOMContentLoaded", init);


// =====================================
// INITIALIZATION
// =====================================

function init() {
    document
        .getElementById("pin-btn")
        ?.addEventListener("click", getLocation);

    document
        .getElementById("save-btn")
        ?.addEventListener("click", saveLocation);

    document
        .getElementById("tracker-btn")
        ?.addEventListener("click", openTracker);

    document
        .getElementById("locations-list")
        ?.addEventListener("click", handleLocationAction);

    renderLocations();
}


// =====================================
// LOCAL STORAGE
// =====================================

function loadLocations() {
    try {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY));

        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Cannot read saved locations:", error);
        return [];
    }
}


function saveLocations() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(savedLocations)
        );
    } catch (error) {
        console.error("Cannot save locations:", error);
        alert("Unable to save data on this device.");
    }
}


// =====================================
// GPS
// =====================================

function getLocation() {
    const display = document.getElementById(
        "coordinates-display"
    );

    if (!display) {
        return;
    }

    if (!navigator.geolocation) {
        display.textContent = "GPS is not supported.";
        return;
    }

    currentData = null;
    display.textContent = "Receiving GPS...";

    navigator.geolocation.getCurrentPosition(
        handleLocationSuccess,
        handleLocationError,
        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        }
    );
}


async function handleLocationSuccess(position) {
    const display = document.getElementById(
        "coordinates-display"
    );

    const {
        latitude: lat,
        longitude: lng,
        accuracy,
        altitude: deviceAltitude
    } = position.coords;

    if (display) {
        display.textContent = "Getting additional data...";
    }

    const [weather, address] = await Promise.all([
        getWeather(lat, lng),
        getAddress(lat, lng)
    ]);

    currentData = {
        lat,
        lng,
        accuracy,
        altitude:
            deviceAltitude !== null
                ? Math.round(deviceAltitude)
                : weather.altitude,
        address,
        temperature: weather.temperature,
        windSpeed: weather.windSpeed,
        time: new Date().toLocaleString()
    };

    showData();
}


function handleLocationError(error) {
    const display = document.getElementById(
        "coordinates-display"
    );

    if (!display) {
        return;
    }

    const messages = {
        1: "Location permission denied.",
        2: "Location is unavailable.",
        3: "GPS request timed out."
    };

    display.textContent =
        messages[error.code] || `GPS error: ${error.message}`;
}


// =====================================
// WEATHER + ALTITUDE
// =====================================

async function getWeather(lat, lng) {
    const result = {
        altitude: "N/A",
        temperature: "N/A",
        windSpeed: "N/A"
    };

    try {
        const params = new URLSearchParams({
            latitude: lat,
            longitude: lng,
            current: "temperature_2m,wind_speed_10m",
            timezone: "auto"
        });

        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?${params}`
        );

        if (!response.ok) {
            throw new Error(`Weather HTTP ${response.status}`);
        }

        const data = await response.json();

        if (Number.isFinite(data.elevation)) {
            result.altitude = Math.round(data.elevation);
        }

        if (data.current) {
            if (Number.isFinite(data.current.temperature_2m)) {
                result.temperature =
                    data.current.temperature_2m;
            }

            if (Number.isFinite(data.current.wind_speed_10m)) {
                result.windSpeed =
                    data.current.wind_speed_10m;
            }
        }
    } catch (error) {
        console.error("Weather request failed:", error);
    }

    return result;
}


// =====================================
// ADDRESS
// =====================================

async function getAddress(lat, lng) {
    try {
        const params = new URLSearchParams({
            lat,
            lon: lng,
            format: "json",
            "accept-language": "en"
        });

        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?${params}`
        );

        if (!response.ok) {
            throw new Error(`Address HTTP ${response.status}`);
        }

        const data = await response.json();

        return data.display_name || "N/A";
    } catch (error) {
        console.error("Address request failed:", error);
        return "N/A";
    }
}


// =====================================
// CURRENT LOCATION DISPLAY
// =====================================

function showData() {
    const display = document.getElementById(
        "coordinates-display"
    );

    if (!display || !currentData) {
        return;
    }

    const data = currentData;

    display.textContent = [
        `Latitude: ${formatCoordinate(data.lat)}`,
        `Longitude: ${formatCoordinate(data.lng)}`,
        `Accuracy: ${formatValue(data.accuracy, " m", true)}`,
        `Altitude: ${formatValue(data.altitude, " m")}`,
        `Address: ${data.address || "N/A"}`,
        `Temperature: ${formatValue(data.temperature, " °C")}`,
        `Wind: ${formatValue(data.windSpeed, " km/h")}`,
        `Time: ${data.time}`
    ].join("\n");
}


// =====================================
// SAVE LOCATION
// =====================================

function saveLocation() {
    if (!currentData) {
        alert("First press PIN.");
        return;
    }

    const noteInput = document.getElementById("note-input");
    const note = noteInput?.value.trim() || "";

    savedLocations.unshift({
        id: createLocationId(),
        note,
        ...currentData
    });

    saveLocations();
    renderLocations();

    if (noteInput) {
        noteInput.value = "";
    }
}


// =====================================
// SAVED LOCATIONS LIST
// =====================================

function renderLocations() {
    const container = document.getElementById(
        "locations-list"
    );

    if (!container) {
        return;
    }

    container.replaceChildren();

    if (savedLocations.length === 0) {
        container.textContent = "The list is empty.";
        return;
    }

    const fragment = document.createDocumentFragment();

    savedLocations.forEach(location => {
        fragment.appendChild(
            createLocationElement(location)
        );
    });

    container.appendChild(fragment);
}


function createLocationElement(location) {
    const item = document.createElement("article");
    item.className = "location-item";
    item.dataset.id = String(location.id);

    const title = document.createElement("strong");
    title.textContent =
        location.note || "Without note";

    const details = document.createElement("pre");
    details.className = "location-details";
    details.textContent = [
        location.address || "N/A",
        `Lat: ${formatCoordinate(location.lat)}`,
        `Lng: ${formatCoordinate(location.lng)}`,
        `Accuracy: ${formatValue(
            location.accuracy,
            " m",
            true
        )}`,
        `Altitude: ${formatValue(
            location.altitude,
            " m"
        )}`,
        `Temperature: ${formatValue(
            location.temperature,
            " °C"
        )}`,
        `Wind: ${formatValue(
            location.windSpeed,
            " km/h"
        )}`,
        location.time || ""
    ].join("\n");

    const buttons = document.createElement("div");
    buttons.className = "location-actions";

    buttons.append(
        createActionButton("GO TO", "map"),
        createActionButton("SHARE", "share"),
        createActionButton("DELETE", "delete")
    );

    item.append(title, details, buttons);

    return item;
}


function createActionButton(text, action) {
    const button = document.createElement("button");

    button.type = "button";
    button.textContent = text;
    button.dataset.action = action;

    return button;
}


function handleLocationAction(event) {
    const button = event.target.closest(
        "button[data-action]"
    );

    if (!button) {
        return;
    }

    const item = button.closest(".location-item");

    if (!item) {
        return;
    }

    const location = savedLocations.find(
        entry => String(entry.id) === item.dataset.id
    );

    if (!location) {
        return;
    }

    switch (button.dataset.action) {
        case "map":
            goToLocation(location);
            break;

        case "share":
            shareLocation(location);
            break;

        case "delete":
            deleteLocation(location.id);
            break;
    }
}


// =====================================
// DELETE
// =====================================

function deleteLocation(id) {
    savedLocations = savedLocations.filter(
        location => location.id !== id
    );

    saveLocations();
    renderLocations();
}


// =====================================
// GOOGLE MAPS
// =====================================

function goToLocation(location) {
    const url = createMapsUrl(
        location.lat,
        location.lng
    );

    window.open(url, "_blank", "noopener,noreferrer");
}


function createMapsUrl(lat, lng) {
    return (
        "https://www.google.com/maps/search/" +
        `?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`
    );
}


// =====================================
// SHARE
// =====================================

async function shareLocation(location) {
    const mapsUrl = createMapsUrl(
        location.lat,
        location.lng
    );

    const text = [
        "MEORE GPS Location",
        "",
        location.note || "",
        "",
        `Latitude: ${location.lat}`,
        `Longitude: ${location.lng}`,
        "",
        `Google Maps: ${mapsUrl}`
    ].join("\n");

    if (navigator.share) {
        try {
            await navigator.share({
                title: "MEORE GPS Location",
                text
            });

            return;
        } catch (error) {
            if (error.name === "AbortError") {
                return;
            }

            console.error("Share failed:", error);
        }
    }

    const whatsappUrl =
        "https://wa.me/?text=" +
        encodeURIComponent(text);

    window.open(
        whatsappUrl,
        "_blank",
        "noopener,noreferrer"
    );
}


// =====================================
// TRACKER
// =====================================

function openTracker() {
    window.location.href = "tracker.html";
}


// =====================================
// HELPERS
// =====================================

function createLocationId() {
    if (crypto.randomUUID) {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}`;
}


function formatCoordinate(value) {
    const number = Number(value);

    return Number.isFinite(number)
        ? number.toFixed(6)
        : "N/A";
}


function formatValue(value, suffix = "", round = false) {
    if (
        value === null ||
        value === undefined ||
        value === "" ||
        value === "N/A"
    ) {
        return "N/A";
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return `${value}${suffix}`;
    }

    return `${round ? Math.round(number) : number}${suffix}`;
}
```
