const STORAGE_KEY = "meore_locations";

let savedLocations = loadLocations();

function loadLocations() {

    try {

        return JSON.parse(
            localStorage.getItem(STORAGE_KEY)
        ) || [];

    } catch {

        return [];

    }

}

function saveLocations() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(savedLocations)
    );

}
