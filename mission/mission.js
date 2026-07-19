// ======================================
// mission.js
// Mission Engine
// ======================================

const MissionConfig = {

    reachRadius: 25,
    minAccuracy: 25

};


// ======================================
// STATE
// ======================================

const MissionState = {

    active: false,

    completed: false,

    startedAt: null,

    finishedAt: null,

    points: []

};


// ======================================
// ENGINE
// ======================================

const Mission = {};


// ======================================
// INIT
// ======================================

Mission.init = function () {

    MissionStorage.load();

};


// ======================================
// START
// selectedPoints = [
//   {
//      id,
//      note,
//      lat,
//      lng
//   }
// ]
// ======================================

Mission.start = function (selectedPoints) {

    Mission.reset();

    if (!Array.isArray(selectedPoints)) {

        return false;

    }

    if (selectedPoints.length === 0) {

        return false;

    }

    MissionState.active = true;

    MissionState.completed = false;

    MissionState.startedAt = Date.now();

    MissionState.finishedAt = null;

    MissionState.points = [];

    for (const point of selectedPoints) {

        MissionState.points.push({

            id: point.id,

            note: point.note || "",

            lat: Number(point.lat),

            lng: Number(point.lng),

            reached: false,

            reachedTime: null

        });

    }

    MissionStorage.save();

    return true;

};


// ======================================
// STOP
// ======================================

Mission.stop = function () {

    MissionState.active = false;

    MissionStorage.save();

};


// ======================================
// RESUME
// ======================================

Mission.resume = function () {

    if (MissionState.completed) {

        return;

    }

    if (MissionState.points.length === 0) {

        return;

    }

    MissionState.active = true;

    MissionStorage.save();

};


// ======================================
// RESET
// ======================================

Mission.reset = function () {

    MissionState.active = false;

    MissionState.completed = false;

    MissionState.startedAt = null;

    MissionState.finishedAt = null;

    MissionState.points = [];

    MissionStorage.clear();

};


// ======================================
// STATUS
// ======================================

Mission.isActive = function () {

    return MissionState.active;

};


Mission.isCompleted = function () {

    return MissionState.completed;

};


// ======================================
// GET POINTS
// ======================================

Mission.getPoints = function () {

    return MissionState.points;

};


// ======================================
// TOTAL POINTS
// ======================================

Mission.getTotalPoints = function () {

    return MissionState.points.length;

};


// ======================================
// REACHED COUNT
// ======================================

Mission.getReachedCount = function () {

    let count = 0;

    for (const point of MissionState.points) {

        if (point.reached) {

            count++;

        }

    }

    return count;

};


// ======================================
// PROGRESS
// ======================================

Mission.getProgress = function () {

    return {

        reached: Mission.getReachedCount(),

        total: Mission.getTotalPoints(),

        percent: MissionUtils.percent(

            Mission.getReachedCount(),

            Mission.getTotalPoints()

        )

    };

};


// ======================================
// DURATION
// ======================================

Mission.getDuration = function () {

    if (!MissionState.startedAt) {

        return 0;

    }

    if (MissionState.completed) {

        return MissionState.finishedAt -

               MissionState.startedAt;

    }

    return Date.now() -

           MissionState.startedAt;

};
