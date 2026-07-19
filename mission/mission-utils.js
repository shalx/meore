// ======================================
// mission-utils.js
// Utility functions for Mission
// ======================================

const MissionUtils = {};


// ======================================
// Degrees -> Radians
// ======================================

MissionUtils.toRadians = function (degrees) {

    return degrees * Math.PI / 180;

};


// ======================================
// Distance between two GPS points
// Returns meters
// ======================================

MissionUtils.distance = function (lat1, lng1, lat2, lng2) {

    const R = 6371000;

    const dLat = MissionUtils.toRadians(lat2 - lat1);
    const dLng = MissionUtils.toRadians(lng2 - lng1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(MissionUtils.toRadians(lat1)) *
        Math.cos(MissionUtils.toRadians(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
    );

    return R * c;

};


// ======================================
// Format distance
// ======================================

MissionUtils.formatDistance = function (meters) {

    if (meters < 1000) {

        return Math.round(meters) + " m";

    }

    return (meters / 1000).toFixed(2) + " km";

};


// ======================================
// Format date & time
// ======================================

MissionUtils.formatDateTime = function (timestamp) {

    if (!timestamp) return "";

    return new Date(timestamp).toLocaleString();

};


// ======================================
// Format duration
// ======================================

MissionUtils.formatDuration = function (milliseconds) {

    if (!milliseconds) return "00:00:00";

    let totalSeconds = Math.floor(milliseconds / 1000);

    const hours = Math.floor(totalSeconds / 3600);

    totalSeconds %= 3600;

    const minutes = Math.floor(totalSeconds / 60);

    const seconds = totalSeconds % 60;

    return (
        String(hours).padStart(2, "0") + ":" +
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0")
    );

};


// ======================================
// Generate simple unique id
// ======================================

MissionUtils.generateId = function () {

    return Date.now() + "_" + Math.random().toString(36).substring(2, 8);

};


// ======================================
// Deep copy object
// ======================================

MissionUtils.clone = function (object) {

    return JSON.parse(JSON.stringify(object));

};


// ======================================
// Clamp value
// ======================================

MissionUtils.clamp = function (value, min, max) {

    return Math.max(min, Math.min(max, value));

};


// ======================================
// Percentage
// ======================================

MissionUtils.percent = function (value, total) {

    if (total === 0) return 0;

    return Math.round((value / total) * 100);

};
