// =====================================
// Tracker Night
// config.js
// Global configuration
// =====================================

// Create global namespace
window.Tracker = window.Tracker || {};

// Configuration
Tracker.config = {

    // Application

    appName: "Tracker Night",

    version: "1.0.0",

    // GPS

    defaultInterval: 10,      // seconds

    minimumAccuracy: 20,      // meters

    enableHighAccuracy: true,

    timeout: 10000,

    maximumAge: 0,

    // Autosave

    autoSaveSeconds: 30,

    // Storage

    storageKey: "tracker_routes",

    // Units

    distanceUnit: "km"

};
