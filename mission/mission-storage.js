// ======================================
// mission-storage.js
// Mission Storage
// ======================================

const MissionStorage = {};

const MISSION_STORAGE_KEY = "meore_mission_state";


// ======================================
// Save Mission
// ======================================

MissionStorage.save = function () {

    try {

        localStorage.setItem(

            MISSION_STORAGE_KEY,

            JSON.stringify(MissionState)

        );

        return true;

    } catch (error) {

        console.error("Mission save failed:", error);

        return false;

    }

};


// ======================================
// Load Mission
// ======================================

MissionStorage.load = function () {

    try {

        const data = localStorage.getItem(

            MISSION_STORAGE_KEY

        );

        if (!data) {

            return false;

        }

        const state = JSON.parse(data);

        if (!state) {

            return false;

        }

        MissionState.active = state.active || false;

        MissionState.completed = state.completed || false;

        MissionState.startedAt = state.startedAt || null;

        MissionState.finishedAt = state.finishedAt || null;

        MissionState.points = Array.isArray(state.points)

            ? state.points

            : [];

        return true;

    } catch (error) {

        console.error("Mission load failed:", error);

        return false;

    }

};


// ======================================
// Clear Mission
// ======================================

MissionStorage.clear = function () {

    try {

        localStorage.removeItem(

            MISSION_STORAGE_KEY

        );

        return true;

    } catch (error) {

        console.error("Mission clear failed:", error);

        return false;

    }

};


// ======================================
// Mission Exists
// ======================================

MissionStorage.exists = function () {

    return localStorage.getItem(

        MISSION_STORAGE_KEY

    ) !== null;

};


// ======================================
// Get Raw JSON
// ======================================

MissionStorage.export = function () {

    return localStorage.getItem(

        MISSION_STORAGE_KEY

    );

};


// ======================================
// Import JSON
// ======================================

MissionStorage.import = function (json) {

    try {

        JSON.parse(json);

        localStorage.setItem(

            MISSION_STORAGE_KEY,

            json

        );

        return true;

    } catch (error) {

        console.error("Mission import failed:", error);

        return false;

    }

};


// ======================================
// Last Start Time
// ======================================

MissionStorage.getStartedAt = function () {

    if (!MissionState.startedAt) {

        return null;

    }

    return new Date(

        MissionState.startedAt

    );

};


// ======================================
// Last Finish Time
// ======================================

MissionStorage.getFinishedAt = function () {

    if (!MissionState.finishedAt) {

        return null;

    }

    return new Date(

        MissionState.finishedAt

    );

};


// ======================================
// Statistics
// ======================================

MissionStorage.getStats = function () {

    let reached = 0;

    for (const point of MissionState.points) {

        if (point.reached) {

            reached++;

        }

    }

    return {

        active: MissionState.active,

        completed: MissionState.completed,

        total: MissionState.points.length,

        reached: reached,

        startedAt: MissionState.startedAt,

        finishedAt: MissionState.finishedAt

    };

};
