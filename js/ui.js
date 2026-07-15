function showCurrentLocation() {
    var display = document.getElementById("coordinates-display");

    if (!display || !currentLocation) {
        return;
    }

    var altitudeText = "Not available";

    if (
        currentLocation.altitude !== null &&
        currentLocation.altitude !== undefined
    ) {
        altitudeText =
            Math.round(currentLocation.altitude) + " m";
    }

    display.textContent =
        "Latitude : " +
        currentLocation.lat.toFixed(6) +
        "\n" +

        "Longitude: " +
        currentLocation.lng.toFixed(6) +
        "\n" +

        "Accuracy : " +
        currentLocation.accuracy +
        " m\n" +

        "Altitude : " +
        altitudeText +
        "\n" +

        "Time     : " +
        currentLocation.time;
}
