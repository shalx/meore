// =====================================
// Tracker Night
// app.js
// Application Entry Point
// =====================================

window.Tracker = window.Tracker || {};

Tracker.app = {

    init() {

        console.log(
            Tracker.config.appName +
            " v" +
            Tracker.config.version
        );

        // Initialize UI
        Tracker.ui.init();

        // Reset interface
        Tracker.ui.reset();

        // Register button events
        Tracker.events.init();

        console.log("Tracker Night Ready");

    }

};

// Start application

document.addEventListener(
    "DOMContentLoaded",
    () => {

        Tracker.app.init();

    }
);
