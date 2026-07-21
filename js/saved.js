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

    if (
        typeof MeoreStorage === "undefined" ||
        typeof MeoreStorage.getAll !== "function"
    ) {

        window.alert(
            "Файл storage.js не подключён."
        );

        return;
    }

    locations = MeoreStorage.getAll();

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


    const latitude =
        Number(location.latitude);

    const longitude =
        Number(location.longitude);

    const accuracy =
        Number(location.accuracy);


    card.innerHTML = `

<div class="location-header">

<label>

<input
type="checkbox"
class="location-check"
data-id="${escapeHtml(location.id)}"
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
${Number.isFinite(latitude)
    ? latitude.toFixed(6)
    : "—"}

</div>


<div class="location-data">

Longitude:
${Number.isFinite(longitude)
    ? longitude.toFixed(6)
    : "—"}

</div>


<div class="location-data">

Accuracy:
${Number.isFinite(accuracy)
    ? Math.round(accuracy) + " m"
    : "—"}

</div>


<div class="location-data">

Time:
${formatDate(location.time)}

</div>


<div class="location-buttons">

<button
class="goto-btn"
data-id="${escapeHtml(location.id)}"
type="button"
>

GO TO

</button>


<button
class="delete-btn"
data-id="${escapeHtml(location.id)}"
type="button"
>

DELETE

</button>

</div>

`;


    const gotoBtn =
        card.querySelector(".goto-btn");

    const deleteBtn =
        card.querySelector(".delete-btn");


    if (gotoBtn) {

        gotoBtn.addEventListener(
            "click",
            () => {

                goToLocation(
                    location.id
                );
            }
        );
    }


    if (deleteBtn) {

        deleteBtn.addEventListener(
            "click",
            () => {

                deleteLocation(
                    location.id
                );
            }
        );
    }


    return card;
}


// =====================================
// SEARCH
// =====================================

function searchLocations() {

    const searchInput =
        document.getElementById(
            "search-input"
        );

    const searchText = searchInput
        ? searchInput.value
            .trim()
            .toLowerCase()
        : "";


    if (!searchText) {

        filteredLocations =
            [...locations];

    } else {

        filteredLocations =
            locations.filter(location => {

                const note = String(
                    location.note || ""
                ).toLowerCase();

                return note.includes(
                    searchText
                );
            });
    }

    renderLocations();
}


// =====================================
// DELETE
// =====================================

function deleteLocation(id) {

    const location =
        MeoreStorage.getById(id);

    if (!location) {

        window.alert(
            "Точка не найдена."
        );

        return;
    }

    const pointName =
        location.note || "эту точку";

    const confirmed =
        window.confirm(
            `Удалить точку "${pointName}"?`
        );

    if (!confirmed) {
        return;
    }

    const removed =
        MeoreStorage.remove(id);

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

    const location =
        MeoreStorage.getById(id);

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
            checkbox =>
                checkbox.dataset.id
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
            .map(id =>
                MeoreStorage.getById(id)
            )
            .filter(Boolean);


    if (
        selectedLocations.length === 0
    ) {

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


    Maps.openMultiple(
        selectedLocations
    );
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
        String(
            filteredLocations.length
        );
}


// =====================================
// OPEN MAIN PAGE
// =====================================

function openMainPage() {

    window.location.href =
        "index.html";
}


// =====================================
// FORMAT DATE
// =====================================

function formatDate(value) {

    if (!value) {
        return "—";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "—";
    }

    return date.toLocaleString(
        "ru-RU"
    );
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
