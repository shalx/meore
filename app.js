```javascript
var STORAGE_KEY = "meore_locations";

var currentData = null;
var savedLocations = [];

try {
    savedLocations =
        JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
} catch (error) {
    savedLocations = [];
}


document.addEventListener("DOMContentLoaded", function () {

    document.getElementById("pin-btn").onclick =
        getLocation;

    document.getElementById("save-btn").onclick =
        saveLocation;

    document.getElementById("tracker-btn").onclick =
        openTracker;

    renderLocations();
});


function getLocation() {

    var display =
        document.getElementById("coordinates-display");

    if (!navigator.geolocation) {
        display.textContent = "GPS is not supported.";
        return;
    }

    display.textContent = "Receiving GPS...";

    navigator.geolocation.getCurrentPosition(

        function (position) {

            currentData = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy,
                time: new Date().toLocaleString()
            };

            display.textContent =
                "Latitude: " +
                currentData.lat.toFixed(6) +
                "\n" +

                "Longitude: " +
                currentData.lng.toFixed(6) +
                "\n" +

                "Accuracy: " +
                Math.round(currentData.accuracy) +
                " m\n" +

                "Time: " +
                currentData.time;
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


function saveLocation() {

    if (!currentData) {
        alert("First press PIN");
        return;
    }

    var noteInput =
        document.getElementById("note-input");

    var newLocation = {
        id: Date.now(),
        note: noteInput.value.trim(),
        lat: currentData.lat,
        lng: currentData.lng,
        accuracy: currentData.accuracy,
        time: currentData.time
    };

    savedLocations.unshift(newLocation);

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(savedLocations)
    );

    noteInput.value = "";

    renderLocations();
}


function renderLocations() {

    var list =
        document.getElementById("locations-list");

    list.innerHTML = "";

    if (savedLocations.length === 0) {
        list.textContent = "The list is empty.";
        return;
    }

    savedLocations.forEach(function (location) {

        var block =
            document.createElement("div");

        var title =
            document.createElement("b");

        var information =
            document.createElement("pre");

        var goButton =
            document.createElement("button");

        var deleteButton =
            document.createElement("button");

        var separator =
            document.createElement("hr");


        title.textContent =
            location.note || "Without note";


        information.textContent =
            "Latitude: " +
            Number(location.lat).toFixed(6) +
            "\n" +

            "Longitude: " +
            Number(location.lng).toFixed(6) +
            "\n" +

            "Accuracy: " +
            Math.round(location.accuracy) +
            " m\n" +

            "Time: " +
            location.time;


        goButton.type = "button";
        goButton.textContent = "GO TO";

        goButton.onclick = function () {
            goToLocation(
                location.lat,
                location.lng
            );
        };


        deleteButton.type = "button";
        deleteButton.textContent = "DELETE";

        deleteButton.onclick = function () {
            deleteLocation(location.id);
        };


        block.appendChild(title);
        block.appendChild(information);
        block.appendChild(goButton);
        block.appendChild(deleteButton);
        block.appendChild(separator);

        list.appendChild(block);
    });
}


function deleteLocation(id) {

    savedLocations =
        savedLocations.filter(function (location) {
            return location.id !== id;
        });

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(savedLocations)
    );

    renderLocations();
}


function goToLocation(lat, lng) {

    window.location.href =
        "https://www.google.com/maps?q=" +
        lat +
        "," +
        lng;
}


function openTracker() {

    window.location.href = "tracker.html";
}
```
