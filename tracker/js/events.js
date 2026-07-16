// =====================================
// Tracker Night
// events.js
// User Events
// =====================================

window.Tracker = window.Tracker || {};

Tracker.events = {

    init() {

        // START

        const startBtn = document.getElementById("startBtn");

        if (startBtn) {

            startBtn.addEventListener("click", () => {

                Tracker.tracker.start();

            });

        }

        // STOP

        const stopBtn = document.getElementById("stopBtn");

        if (stopBtn) {

            stopBtn.addEventListener("click", () => {

                Tracker.tracker.stop();

            });

        }

        // SAVE ROUTE

        const saveBtn = document.getElementById("saveBtn");

        if (saveBtn) {

            saveBtn.addEventListener("click", () => {

                Tracker.storage.saveCurrentTrack();

            });

        }

        // BACK

        const backBtn = document.getElementById("backBtn");

        if (backBtn) {

            backBtn.addEventListener("click", () => {

                window.location.href = "../";

            });

        }

        // Interval

        const interval = document.getElementById("interval");

        if (interval) {

            interval.addEventListener("change", (e) => {

                Tracker.config.defaultInterval =
                    parseInt(e.target.value);

            });

        }

    }

};
