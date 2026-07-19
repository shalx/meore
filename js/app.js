let currentLocation = null;

document.addEventListener(
    "DOMContentLoaded",
    init
);

function init() {

    document
        .getElementById("pin-btn")
        .addEventListener("click", getLocation);

    document
        .getElementById("save-btn")
        .addEventListener("click", saveLocation);

    document
        .getElementById("tracker-btn")
        .addEventListener("click", openTracker);

    renderLocations();

}
function openTracker() {

    window.location.href = "./tracker/";

}
document.getElementById("search-input")
    .addEventListener("input", searchLocations);
function searchLocations() {

    const text = document
        .getElementById("search-input")
        .value
        .trim()
        .toLowerCase();

    const filtered = savedLocations.filter(location => {

        const note = (location.note || "").toLowerCase();

        return note.includes(text);

    });

    renderLocations(filtered);

}
