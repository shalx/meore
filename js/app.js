let currentLocation = null;

document.addEventListener("DOMContentLoaded", init);

function init() {

    const pinBtn = document.getElementById("pin-btn");
    const saveBtn = document.getElementById("save-btn");
    const searchInput = document.getElementById("search-input");

    if (pinBtn) {
        pinBtn.addEventListener("click", getLocation);
    }

    if (saveBtn) {
        saveBtn.addEventListener("click", saveLocation);
    }

    if (searchInput) {
        searchInput.addEventListener("input", searchLocations);
    }

    renderLocations();
}


// ================================
// ПОИСК ПО NOTE
// ================================

function searchLocations() {

    const searchInput = document.getElementById("search-input");

    if (!searchInput) {
        return;
    }

    const text = searchInput.value
        .trim()
        .toLowerCase();

    const filteredLocations = savedLocations.filter(location => {

        const note = String(location.note || "")
            .toLowerCase();

        return note.includes(text);

    });

    renderLocations(filteredLocations);
}
