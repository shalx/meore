// =====================================
// Tracker Night
// ui.js
// User Interface
// =====================================

window.Tracker = window.Tracker || {};

Tracker.ui = {

    status: null,
    distance: null,
    duration: null,
    points: null,

    init() {

        this.status   = document.getElementById("status");
        this.distance = document.getElementById("distance");
        this.duration = document.getElementById("duration");
        this.points   = document.getElementById("points");

    },

    setStatus(text) {

        if (this.status) {
            this.status.textContent = text;
        }

    },

    setDistance(meters) {

        if (this.distance) {
            this.distance.textContent =
                Tracker.utils.formatDistance(meters);
        }

    },

    setDuration(milliseconds) {

        if (this.duration) {
            this.duration.textContent =
                Tracker.utils.formatDuration(milliseconds);
        }

    },

    setPoints(count) {

        if (this.points) {
            this.points.textContent = count;
        }

    },

    reset() {

        this.setStatus("READY");
        this.setDistance(0);
        this.setDuration(0);
        this.setPoints(0);

    }

};
