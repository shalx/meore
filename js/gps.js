function getLocation() {
    var display = document.getElementById("coordinates-display");

    if (!display) {
        return;
    }

    if (!navigator.geolocation) {
        display.textContent = "GPS is not supported.";
        return;
    }

    display.textContent = "Receiving GPS...";

    navigator.geolocation.getCurrentPosition(
        function (position) {
            currentLocation = {
                id: Date.now(),
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: Math.round(position.coords.accuracy),
                altitude: position.coords.altitude,
                time: new Date().toLocaleString()
            };

            showCurrentLocation();
        },

        function (error) {
            display.textContent =
                "GPS error: " + error.message;
        },

        {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0
        }
    );
}
