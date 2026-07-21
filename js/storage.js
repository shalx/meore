"use strict";

/*
=========================================
MEORE FREE
storage.js
Работа с localStorage
=========================================
*/

const Storage = (() => {

    const STORAGE_KEY = "meore_locations";


    // =====================================
    // PRIVATE
    // =====================================

    function read() {

    }


    function write(locations) {

    }


    function generateId() {

    }


    // =====================================
    // PUBLIC
    // =====================================

    function getAll() {

    }


    function getById(id) {

    }


    function save(location) {

    }


    function update(location) {

    }


    function remove(id) {

    }


    function exists(id) {

    }


    function count() {

    }


    function clear() {

    }


    return {

        getAll,

        getById,

        save,

        update,

        remove,

        exists,

        count,

        clear

    };

})();
function save(location) {

    if (!location || typeof location !== "object") {
        return null;
    }

    const latitude = Number(location.latitude);
    const longitude = Number(location.longitude);

    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
    ) {
        return null;
    }

    const locations = read();

    const newLocation = {

        id: generateId(),

        note: String(location.note || "").trim(),

        latitude,

        longitude,

        accuracy: Number.isFinite(Number(location.accuracy))
            ? Number(location.accuracy)
            : null,

        time: location.time || new Date().toISOString(),

        savedAt: new Date().toISOString()
    };

    locations.push(newLocation);

    const success = write(locations);

    if (!success) {
        return null;
    }

    return newLocation;
}
function generateId() {

    if (
        window.crypto &&
        typeof window.crypto.randomUUID === "function"
    ) {

        return crypto.randomUUID();

    }

    return (
        Date.now().toString(36) +
        "-" +
        Math.random().toString(36).substring(2, 11)
    );

}
function read() {

    try {

        const data = localStorage.getItem(STORAGE_KEY);

        if (!data) {
            return [];
        }

        const locations = JSON.parse(data);

        if (!Array.isArray(locations)) {
            return [];
        }

        return locations;

    } catch (error) {

        console.error("Storage read error:", error);

        return [];
    }

}
function write(locations) {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(locations)
        );

        return true;

    } catch (error) {

        console.error("Storage write error:", error);

        return false;
    }

}
