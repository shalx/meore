// =====================================
// Tracker Night
// timer.js
// Track duration timer
// =====================================

window.Tracker = window.Tracker || {};

Tracker.timer = {

    timerId: null,
    startedAt: null,
    elapsedBeforeStart: 0,

    start(startedAt = Date.now()) {

        this.stop();

        this.startedAt = startedAt;

        this.update();

        this.timerId = setInterval(() => {
            this.update();
        }, 1000);

    },

    stop() {

        if (this.timerId !== null) {
            clearInterval(this.timerId);
            this.timerId = null;
        }

        if (this.startedAt !== null) {
            this.elapsedBeforeStart = this.getElapsed();
            this.startedAt = null;
        }

    },

    reset() {

        this.stop();

        this.startedAt = null;
        this.elapsedBeforeStart = 0;

        Tracker.ui.setDuration(0);

    },

    getElapsed() {

        if (this.startedAt === null) {
            return this.elapsedBeforeStart;
        }

        return this.elapsedBeforeStart +
            (Date.now() - this.startedAt);

    },

    update() {

        const elapsed = this.getElapsed();

        Tracker.ui.setDuration(elapsed);

        return elapsed;

    }

};
