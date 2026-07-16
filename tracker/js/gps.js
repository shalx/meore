// =====================================
// Tracker Night
// gps.js
// GPS Engine
// =====================================

window.Tracker = window.Tracker || {};

Tracker.gps = {

    watchId: null,

    running: false,

    start() {

        if (!navigator.geolocation) {

            alert("Geolocation is not supported.");

            return;

        }

        if (this.running) {

            return;

        }

        this.running = true;

        this.watchId = navigator.geolocation.watchPosition(

            this.success.bind(this),

            this.error.bind(this),

            {

                enableHighAccuracy:
                    Tracker.config.enableHighAccuracy,

                timeout:
                    Tracker.config.timeout,

                maximumAge:
                    Tracker.config.maximumAge

            }

        );

    },

    stop() {

        if (this.watchId !== null) {

            navigator.geolocation.clearWatch(this.watchId);

            this.watchId = null;

        }

        this.running = false;

    },

    success(position) {

        const point = {

            lat: position.coords.latitude,

            lng: position.coords.longitude,

            accuracy: position.coords.accuracy,

            time: Date.now()

        };

        if (
            Tracker.tracker &&
            typeof Tracker.tracker.onPosition === "function"
        ) {

            Tracker.tracker.onPosition(point);

        }

    },

    error(error) {

        console.error("GPS Error:", error);

        Tracker.ui.setStatus("GPS ERROR");

    }

};
