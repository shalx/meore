"use strict";

/*
=========================================
MEORE FREE
saved.js
Saved Points
=========================================
*/


// =====================================
// GLOBAL
// =====================================

let locations = [];

let filteredLocations = [];


// =====================================
// START
// =====================================

document.addEventListener(
    "DOMContentLoaded",
    init
);


function init() {

    const backBtn =
        document.getElementById("back-btn");

    const searchInput =
        document.getElementById("search-input");

    const gotoSelectedBtn =
        document.getElementById(
            "goto-selected-btn"
        );


    if (backBtn) {

        backBtn.addEventListener(
            "click",
            openMainPage
        );

    }


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            searchLocations
        );

    }


    if (gotoSelectedBtn) {

        gotoSelectedBtn.addEventListener(
            "click",
            goToSelected
        );

    }


    loadLocations();

}


// =====================================
// LOAD
// =====================================

function loadLocations() {

    locations = Storage.getAll();

    filteredLocations = [...locations];

    renderLocations();

}


// =====================================
// RENDER
// =====================================

function renderLocations() {

    const list =
        document.getElementById(
            "locations-list"
        );

    if (!list) {
        return;
    }

    list.innerHTML = "";

    updateCounter();

    if (filteredLocations.length === 0) {

        list.innerHTML =

            "<p>No saved points.</p>";

        return;

    }

    filteredLocations.forEach(location => {

        list.appendChild(

            createLocationCard(location)

        );

    });

}


// =====================================
// CREATE CARD
// =====================================

function createLocationCard(location) {

    const card =
        document.createElement("div");

    card.className =
        "location-card";


    card.innerHTML = `

<div class="location-header">

<label>

<input
type="checkbox"
class="location-check"
data-id="${location.id}"
>

</label>

<div class="location-title">

${escapeHtml(
location.note || "No note"
)}

</div>

</div>


<div class="location-data">

Latitude:
${Number(location.latitude)
.toFixed(6)}

</div>


<div class="location-data">

Longitude:
${Number(location.longitude)
.toFixed(6)}

</div>


<div class="location-data">

Accuracy:
${location.accuracy ?? "-"}

</div>


<div class="location-data">

Time:
${formatDate(location.time)}

</div>


<div class="location-buttons">

<button
class="goto-btn"
data-id="${location.id}"
>

GO TO

</button>


<button
class="delete-btn"
data-id="${location.id}"
>

DELETE

</button>

</div>

`;

    card
        .querySelector(".goto-btn")
        .addEventListener(

            "click",

            () => {

                goToLocation(
                    location.id
                );

            }

        );

    card
        .querySelector(".delete-btn")
        .addEventListener(

            "click",

            () => {

                deleteLocation(
                    location.id
                );

            }

        );

    return card;

}
// =====================================
// SEARCH
// =====================================

function searchLocations() {

    const searchInput =
        document.getElementById("search-input");

    const searchText = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";

    if (!searchText) {

        filteredLocations = [...locations];

    } else {

        filteredLocations = locations.filter(location => {

            const note = String(
                location.note || ""
            ).toLowerCase();

            return note.includes(searchText);
        });
    }

    renderLocations();
}


// =====================================
// DELETE
// =====================================

function deleteLocation(id) {

    const location = Storage.getById(id);

    if (!location) {
        return;
    }

    const pointName =
        location.note || "эту точку";

    const confirmed = window.confirm(
        `Удалить точку "${pointName}"?`
    );

    if (!confirmed) {
        return;
    }

    const removed = Storage.remove(id);

    if (!removed) {

        window.alert(
            "Не удалось удалить точку."
        );

        return;
    }

    loadLocations();
}


// =====================================
// GO TO ONE LOCATION
// =====================================

function goToLocation(id) {

    const location = Storage.getById(id);

    if (!location) {

        window.alert(
            "Точка не найдена."
        );

        return;
    }

    if (
        typeof Maps === "undefined" ||
        typeof Maps.openPoint !== "function"
    ) {

        window.alert(
            "Модуль Google Maps не подключён."
        );

        return;
    }

    Maps.openPoint(location);
}


// =====================================
// GO TO SELECTED
// =====================================

function goToSelected() {

    const checkboxes =
        document.querySelectorAll(
            ".location-check:checked"
        );

    const selectedIds =
        Array.from(checkboxes).map(
            checkbox => checkbox.dataset.id
        );

    if (selectedIds.length === 0) {

        window.alert(
            "Выберите хотя бы одну точку."
        );

        return;
    }

    if (selectedIds.length > 9) {

        window.alert(
            "Можно выбрать не более 9 точек."
        );

        return;
    }

    const selectedLocations =
        selectedIds
            .map(id => Storage.getById(id))
            .filter(Boolean);

    if (selectedLocations.length === 0) {

        window.alert(
            "Выбранные точки не найдены."
        );

        return;
    }

    if (
        typeof Maps === "undefined" ||
        typeof Maps.openMultiple !== "function"
    ) {

        window.alert(
            "Модуль Google Maps не подключён."
        );

        return;
    }

    Maps.openMultiple(selectedLocations);
}


// =====================================
// UPDATE COUNTER
// =====================================

function updateCounter() {

    const totalCount =
        document.getElementById(
            "total-count"
        );

    if (!totalCount) {
        return;
    }

    totalCount.textContent =
        String(filteredLocations.length);
}


// =====================================
// OPEN MAIN PAGE
// =====================================

function openMainPage() {

    window.location.href = "index.html";
}


// =====================================
// FORMAT DATE
// =====================================

function formatDate(value) {

    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleString("ru-RU");
}


// =====================================
// ESCAPE HTML
// =====================================

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
