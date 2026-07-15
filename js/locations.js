function saveLocation() {
    if (!currentLocation) {
        alert("First press PIN.");
        return;
    }

    var noteInput = document.getElementById("note-input");
    var note = noteInput ? noteInput.value.trim() : "";

    var location = {
        id: Date.now(),
        note: note,
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        accuracy: currentLocation.accuracy,
        altitude: currentLocation.altitude,
        time: currentLocation.time
    };

    savedLocations.unshift(location);

    saveLocations();

    if (noteInput) {
        noteInput.value = "";
    }

    renderLocations();
}


function renderLocations() {
    var list = document.getElementById("locations-list");

    if (!list) {
        return;
    }

    list.innerHTML = "";

    if (savedLocations.length === 0) {
        list.textContent = "No saved points.";
        return;
    }

    savedLocations.forEach(function (location) {
        var card = document.createElement("div");
        card.className = "location";

        var title = document.createElement("b");
        title.textContent =
            location.note || "Without note";

        var information =
            document.createElement("pre");

        var altitudeText = "Not available";

        if (
            location.altitude !== null &&
            location.altitude !== undefined
        ) {
            altitudeText =
                Math.round(location.altitude) + " m";
        }

        information.textContent =
            "Latitude : " +
            Number(location.lat).toFixed(6) +
            "\n" +

            "Longitude: " +
            Number(location.lng).toFixed(6) +
            "\n" +

            "Accuracy : " +
            location.accuracy +
            " m\n" +

            "Altitude : " +
            altitudeText +
            "\n" +

            "Time     : " +
            location.time;

        var buttons =
            document.createElement("div");

        buttons.className = "location-buttons";

        var goButton =
            document.createElement("button");

        goButton.type = "button";
        goButton.textContent = "GO TO";

        goButton.onclick = function () {
            goToLocation(
                location.lat,
                location.lng
            );
        };

        var deleteButton =
            document.createElement("button");

        deleteButton.type = "button";
        deleteButton.textContent = "DELETE";

        deleteButton.onclick = function () {
            deleteLocation(location.id);
        };

        buttons.appendChild(goButton);
        buttons.appendChild(deleteButton);

        card.appendChild(title);
        card.appendChild(information);
        card.appendChild(buttons);

        list.appendChild(card);
    });
}


function deleteLocation(id) {
    savedLocations = savedLocations.filter(
        function (location) {
            return location.id !== id;
        }
    );

    saveLocations();
    renderLocations();
}
