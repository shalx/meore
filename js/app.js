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
