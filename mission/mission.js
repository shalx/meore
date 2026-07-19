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
// ======================================
// CHECK POSITION
// Called from mission-gps.js
// ======================================

Mission.checkPosition = function (lat, lng, accuracy) {

    if (!MissionState.active) return;

    if (MissionState.completed) return;

    if (accuracy > MissionConfig.minAccuracy) return;

    for (const point of MissionState.points) {

        if (point.reached) continue;

        const distance = MissionUtils.distance(

            lat,
            lng,
            point.lat,
            point.lng

        );

        if (distance <= MissionConfig.reachRadius) {

            Mission.reachPoint(point.id);

        }

    }

};
// ======================================
// REACH POINT
// ======================================

Mission.reachPoint = function (pointId) {

    for (const point of MissionState.points) {

        if (point.id !== pointId) continue;

        point.reached = true;

        point.reachedTime = Date.now();

        break;

    }

    MissionStorage.save();

    if (typeof MissionUI !== "undefined") {

        MissionUI.update();

        MissionUI.showReached(pointId);

    }

    Mission.checkCompleted();

};
// ======================================
// CHECK COMPLETED
// ======================================

Mission.checkCompleted = function () {

    for (const point of MissionState.points) {

        if (!point.reached) {

            return false;

        }

    }

    Mission.complete();

    return true;

};
// ======================================
// COMPLETE
// ======================================

Mission.complete = function () {

    MissionState.active = false;

    MissionState.completed = true;

    MissionState.finishedAt = Date.now();

    MissionStorage.save();

    if (typeof MissionUI !== "undefined") {

        MissionUI.showCompleted();

    }

};
// ======================================
// GET POINT
// ======================================

Mission.getPoint = function (id) {

    for (const point of MissionState.points) {

        if (point.id === id) {

            return point;

        }

    }

    return null;

};
// ======================================
// GET REMAINING POINTS
// ======================================

Mission.getRemainingPoints = function () {

    return MissionState.points.filter(
// ======================================
// GET REACHED POINTS
// ======================================

Mission.getReachedPoints = function () {

    return MissionState.points.filter(

        point => point.reached

    );

};
        point => !point.reached

    );

};
// ======================================
// REMOVE POINT
// (optional)
// ======================================

Mission.removePoint = function (id) {

    MissionState.points = MissionState.points.filter(

        point => point.id !== id

    );

    MissionStorage.save();

};
// ======================================
// ADD POINT
// (optional)
// ======================================

Mission.addPoint = function (point) {

    MissionState.points.push({

        id: point.id,

        note: point.note,

        lat: point.lat,

        lng: point.lng,

        reached: false,

        reachedTime: null

    });

    MissionStorage.save();

};
// ======================================
// DEBUG
// ======================================

Mission.print = function () {

    console.log(MissionState);

};
