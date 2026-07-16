// =====================================
// Tracker Night
// route.js
// Distance calculations
// =====================================

window.Tracker = window.Tracker || {};

Tracker.route = {

    // Distance between two GPS points (meters)

    distance(lat1, lon1, lat2, lon2) {

        const R = 6371000;

        const dLat = Tracker.utils.toRadians(lat2 - lat1);

        const dLon = Tracker.utils.toRadians(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +

            Math.cos(Tracker.utils.toRadians(lat1)) *
            Math.cos(Tracker.utils.toRadians(lat2)) *

            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

        const c = 2 * Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

        return R * c;

    },

    // Calculate full route length

    total(points) {

        if (!points || points.length < 2) {
            return 0;
        }

        let total = 0;

        for (let i = 1; i < points.length; i++) {

            total += this.distance(

                points[i - 1].lat,
                points[i - 1].lng,

                points[i].lat,
                points[i].lng

            );

        }

        return total;

    }

};
