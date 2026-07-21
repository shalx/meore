"use strict";

/*
=========================================
MEORE FREE
maps.js
Google Maps
=========================================
*/

const Maps = (() => {

    // =====================================
    // PRIVATE
    // =====================================

    function openUrl(url) {

        if (!url) {
            return;
        }

        window.open(
            url,
            "_blank"
        );

    }


    // =====================================
    // PUBLIC
    // =====================================

    function openPoint(location) {

        if (!location) {
            return;
        }

        const latitude =
            Number(location.latitude);

        const longitude =
            Number(location.longitude);

        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
        ) {
            return;
        }

        const url =

            "https://www.google.com/maps/search/?api=1&query=" +

            latitude +

            "," +

            longitude;

        openUrl(url);

    }


    function openMultiple(locations) {

        if (
            !Array.isArray(locations) ||
            locations.length === 0
        ) {
            return;
        }

        const route = [];

        locations.forEach(location => {

            const latitude =
                Number(location.latitude);

            const longitude =
                Number(location.longitude);

            if (
                Number.isFinite(latitude) &&
                Number.isFinite(longitude)
            ) {

                route.push(

                    latitude +
                    "," +
                    longitude

                );

            }

        });

        if (route.length === 0) {
            return;
        }

        const url =

            "https://www.google.com/maps/dir/" +

            route.join("/");

        openUrl(url);

    }


    return {

        openPoint,

        openMultiple

    };

})();
