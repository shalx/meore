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
    // PRIVATE FUNCTIONS
    // =====================================

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

        if (!Array.isArray(locations)) {
            return false;
        }

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


    function generateId() {

        if (
            window.crypto &&
            typeof window.crypto.randomUUID === "function"
        ) {
            return window.crypto.randomUUID();
        }

        return (
            Date.now().toString(36) +
            "-" +
            Math.random().toString(36).slice(2, 11)
        );
    }


    function normalizeId(id) {

        return String(id || "").trim();
    }


    function normalizeLocation(location) {

        if (!location || typeof location !== "object") {
            return null;
        }

        const latitude = Number(location.latitude);
        const longitude = Number(location.longitude);
        const accuracy = Number(location.accuracy);

        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
        ) {
            return null;
        }

        return {
            note: String(location.note || "").trim(),

            latitude,

            longitude,

            accuracy: Number.isFinite(accuracy)
                ? accuracy
                : null,

            time: location.time
                ? String(location.time)
                : new Date().toISOString()
        };
    }


    // =====================================
    // PUBLIC FUNCTIONS
    // =====================================

    function getAll() {

        return read();
    }


    function getById(id) {

        const normalizedId = normalizeId(id);

        if (!normalizedId) {
            return null;
        }

        const locations = read();

        return (
            locations.find(
                location => location.id === normalizedId
            ) || null
        );
    }


    function save(location) {

        const normalizedLocation =
            normalizeLocation(location);

        if (!normalizedLocation) {
            return null;
        }

        const locations = read();

        const newLocation = {

            id: generateId(),

            ...normalizedLocation,

            savedAt: new Date().toISOString()
        };

        locations.push(newLocation);

        const success = write(locations);

        if (!success) {
            return null;
        }

        return newLocation;
    }


    function update(location) {

        if (!location || typeof location !== "object") {
            return null;
        }

        const id = normalizeId(location.id);

        if (!id) {
            return null;
        }

        const locations = read();

        const index = locations.findIndex(
            item => item.id === id
        );

        if (index === -1) {
            return null;
        }

        const oldLocation = locations[index];

        const latitude = Number(
            location.latitude ?? oldLocation.latitude
        );

        const longitude = Number(
            location.longitude ?? oldLocation.longitude
        );

        const accuracy = Number(
            location.accuracy ?? oldLocation.accuracy
        );

        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
        ) {
            return null;
        }

        const updatedLocation = {

            ...oldLocation,

            note: String(
                location.note ?? oldLocation.note ?? ""
            ).trim(),

            latitude,

            longitude,

            accuracy: Number.isFinite(accuracy)
                ? accuracy
                : null,

            time: location.time
                ? String(location.time)
                : oldLocation.time,

            updatedAt: new Date().toISOString()
        };

        locations[index] = updatedLocation;

        const success = write(locations);

        if (!success) {
            return null;
        }

        return updatedLocation;
    }


    function remove(id) {

        const normalizedId = normalizeId(id);

        if (!normalizedId) {
            return false;
        }

        const locations = read();

        const filteredLocations = locations.filter(
            location => location.id !== normalizedId
        );

        if (filteredLocations.length === locations.length) {
            return false;
        }

        return write(filteredLocations);
    }


    function exists(id) {

        const normalizedId = normalizeId(id);

        if (!normalizedId) {
            return false;
        }

        const locations = read();

        return locations.some(
            location => location.id === normalizedId
        );
    }


    function count() {

        return read().length;
    }


    function clear() {

        try {

            localStorage.removeItem(STORAGE_KEY);

            return true;

        } catch (error) {

            console.error("Storage clear error:", error);

            return false;
        }
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
