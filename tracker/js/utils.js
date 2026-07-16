// =====================================
// Tracker Night
// utils.js
// Common helper functions
// =====================================

window.Tracker = window.Tracker || {};

Tracker.utils = {

    // Generate unique ID
    generateId() {

        if (window.crypto && crypto.randomUUID) {
            return crypto.randomUUID();
        }

        return "id-" + Date.now() + "-" +
               Math.random().toString(16).slice(2);

    },

    // Unix time (milliseconds)
    unixTime() {

        return Date.now();

    },

    // Round number
    round(value, digits = 2) {

        return Number(value.toFixed(digits));

    },

    // Meters -> Kilometers
    formatDistance(meters) {

        return (meters / 1000).toFixed(3) + " km";

    },

    // Format duration
    formatDuration(milliseconds) {

        let totalSeconds = Math.floor(milliseconds / 1000);

        let hours = Math.floor(totalSeconds / 3600);

        let minutes = Math.floor((totalSeconds % 3600) / 60);

        let seconds = totalSeconds % 60;

        return String(hours).padStart(2, "0") + ":" +
               String(minutes).padStart(2, "0") + ":" +
               String(seconds).padStart(2, "0");

    },

    // Unix -> local date/time
    formatDate(unix) {

        return new Date(unix).toLocaleString();

    },

    // Degrees -> Radians
    toRadians(degrees) {

        return degrees * Math.PI / 180;

    }

};
