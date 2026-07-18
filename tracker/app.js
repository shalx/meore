// =============================================
// TRACKER NIGHT
// tracker.js
//
// Отслеживает только остановки.
//
// Логика:
// 1. Пользователь остаётся в небольшой зоне.
// 2. Через 10 минут остановка подтверждается.
// 3. Когда пользователь удаляется более чем
//    на 100 метров, остановка завершается.
// 4. Остановки получают номера #1, #2, #3...
// =============================================

(function () {
    "use strict";

    // =============================================
    // CONFIG
    // =============================================

    const DEFAULT_CONFIG = {
        // Время подтверждения остановки: 10 минут
        stopConfirmationTime: 10 * 60 * 1000,

        // Максимальное удаление от центра кандидата,
        // при котором пользователь считается стоящим
        candidateRadius: 35,

        // После удаления на 100 метров
        // подтверждённая остановка завершается
        stopExitRadius: 100,

        // Точность хуже этого значения можно игнорировать
        maxAccuracy: 100,

        // Минимальный интервал обработки GPS
        minPositionInterval: 5000,

        // Ключ временного хранения
        storageKey: "tracker_night_state",

        // Сохранять состояние после каждого изменения
        autoSave: true
    };


    // =============================================
    // STATE
    // =============================================

    const state = {
        isTracking: false,

        startedAt: null,

        stoppedAt: null,

        lastPosition: null,

        lastProcessedAt: 0,

        // Неподтверждённая остановка
        candidateStop: null,

        // Текущая подтверждённая остановка
        activeStop: null,

        // Завершённые остановки
        stops: [],

        nextStopNumber: 1
    };


    let config = {
        ...DEFAULT_CONFIG
    };


    // =============================================
    // PUBLIC API
    // =============================================

    const TrackerNight = {
        init,
        start,
        stop,
        reset,

        handlePosition,

        getState,
        getStops,
        getCandidateStop,
        getActiveStop,

        loadState,
        saveState,

        calculateDistance,
        formatDuration
    };


    window.TrackerNight = TrackerNight;


    // =============================================
    // INITIALIZATION
    // =============================================

    function init(customConfig = {}) {
        config = {
            ...DEFAULT_CONFIG,
            ...getExternalConfig(),
            ...customConfig
        };

        loadState();

        emit("tracker:initialized", {
            state: getState(),
            config: { ...config }
        });

        return TrackerNight;
    }


    function getExternalConfig() {
        if (
            window.TrackerConfig &&
            typeof window.TrackerConfig === "object"
        ) {
            return window.TrackerConfig;
        }

        if (
            window.CONFIG &&
            typeof window.CONFIG === "object"
        ) {
            return window.CONFIG;
        }

        return {};
    }


    // =============================================
    // START / STOP TRACKING
    // =============================================

    function start() {
        if (state.isTracking) {
            return false;
        }

        state.isTracking = true;
        state.startedAt = Date.now();
        state.stoppedAt = null;
        state.lastProcessedAt = 0;

        saveState();

        emit("tracker:started", {
            startedAt: state.startedAt
        });

        return true;
    }


    function stop() {
        if (!state.isTracking) {
            return false;
        }

        state.isTracking = false;
        state.stoppedAt = Date.now();

        // Кандидат ещё не подтверждён —
        // при остановке трекера его не сохраняем
        cancelCandidate("tracking-stopped");

        // Если была активная подтверждённая остановка,
        // завершаем её в момент выключения трекера
        if (state.activeStop) {
            finishActiveStop(
                state.lastPosition,
                "tracking-stopped"
            );
        }

        saveState();

        emit("tracker:stopped", {
            stoppedAt: state.stoppedAt,
            stops: getStops()
        });

        return true;
    }


    // =============================================
    // GPS POSITION
    // =============================================

    function handlePosition(position) {
        if (!state.isTracking) {
            return false;
        }

        const point = normalizePosition(position);

        if (!point) {
            emit("tracker:position-rejected", {
                reason: "invalid-position",
                position
            });

            return false;
        }

        if (
            Number.isFinite(point.accuracy) &&
            point.accuracy > config.maxAccuracy
        ) {
            emit("tracker:position-rejected", {
                reason: "low-accuracy",
                accuracy: point.accuracy,
                point
            });

            return false;
        }

        const now = point.timestamp || Date.now();

        if (
            state.lastProcessedAt &&
            now - state.lastProcessedAt <
                config.minPositionInterval
        ) {
            return false;
        }

        state.lastProcessedAt = now;
        state.lastPosition = point;

        emit("tracker:position", {
            point
        });

        processPoint(point);

        saveState();

        return true;
    }


    function normalizePosition(position) {
        if (!position) {
            return null;
        }

        // Формат GeolocationPosition
        if (position.coords) {
            const latitude = Number(
                position.coords.latitude
            );

            const longitude = Number(
                position.coords.longitude
            );

            if (
                !Number.isFinite(latitude) ||
                !Number.isFinite(longitude)
            ) {
                return null;
            }

            return {
                latitude,
                longitude,

                accuracy: toNumberOrNull(
                    position.coords.accuracy
                ),

                altitude: toNumberOrNull(
                    position.coords.altitude
                ),

                speed: toNumberOrNull(
                    position.coords.speed
                ),

                heading: toNumberOrNull(
                    position.coords.heading
                ),

                timestamp:
                    Number(position.timestamp) ||
                    Date.now()
            };
        }

        // Обычный объект
        const latitude = Number(
            position.latitude ?? position.lat
        );

        const longitude = Number(
            position.longitude ??
            position.lng ??
            position.lon
        );

        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
        ) {
            return null;
        }

        return {
            latitude,
            longitude,

            accuracy: toNumberOrNull(
                position.accuracy
            ),

            altitude: toNumberOrNull(
                position.altitude
            ),

            speed: toNumberOrNull(
                position.speed
            ),

            heading: toNumberOrNull(
                position.heading
            ),

            timestamp:
                Number(position.timestamp) ||
                Number(position.time) ||
                Date.now()
        };
    }


    function processPoint(point) {
        if (state.activeStop) {
            processActiveStop(point);
            return;
        }

        if (state.candidateStop) {
            processCandidateStop(point);
            return;
        }

        createCandidate(point);
    }


    // =============================================
    // CANDIDATE STOP
    // =============================================

    function createCandidate(point) {
        state.candidateStop = {
            startedAt: point.timestamp,

            center: {
                latitude: point.latitude,
                longitude: point.longitude
            },

            lastPosition: {
                ...point
            },

            sampleCount: 1,

            maxDistance: 0
        };

        emit("tracker:candidate-started", {
            candidate: clone(state.candidateStop),
            requiredDuration:
                config.stopConfirmationTime
        });
    }


    function processCandidateStop(point) {
        const candidate = state.candidateStop;

        if (!candidate) {
            return;
        }

        const distance = calculateDistance(
            candidate.center.latitude,
            candidate.center.longitude,
            point.latitude,
            point.longitude
        );

        candidate.lastPosition = {
            ...point
        };

        candidate.maxDistance = Math.max(
            candidate.maxDistance || 0,
            distance
        );

        if (distance > config.candidateRadius) {
            cancelCandidate(
                "left-candidate-radius",
                {
                    distance
                }
            );

            // Новая позиция может стать началом
            // следующего кандидата
            createCandidate(point);

            return;
        }

        updateCandidateCenter(candidate, point);

        const duration =
            point.timestamp - candidate.startedAt;

        emit("tracker:candidate-progress", {
            candidate: clone(candidate),
            duration,
            remaining: Math.max(
                0,
                config.stopConfirmationTime -
                    duration
            ),
            distance
        });

        if (
            duration >= config.stopConfirmationTime
        ) {
            confirmCandidate(point);
        }
    }


    function updateCandidateCenter(candidate, point) {
        const count =
            Number(candidate.sampleCount) || 1;

        const newCount = count + 1;

        candidate.center.latitude =
            (
                candidate.center.latitude *
                    count +
                point.latitude
            ) / newCount;

        candidate.center.longitude =
            (
                candidate.center.longitude *
                    count +
                point.longitude
            ) / newCount;

        candidate.sampleCount = newCount;
    }


    function confirmCandidate(point) {
        const candidate = state.candidateStop;

        if (!candidate) {
            return;
        }

        const stopNumber =
            state.nextStopNumber;

        const stop = {
            id: createStopId(),

            number: stopNumber,

            title: `#${stopNumber}`,

            latitude:
                candidate.center.latitude,

            longitude:
                candidate.center.longitude,

            startedAt:
                candidate.startedAt,

            confirmedAt:
                point.timestamp,

            endedAt: null,

            duration: null,

            status: "active",

            sampleCount:
                candidate.sampleCount,

            maxCandidateDistance:
                candidate.maxDistance || 0,

            accuracy:
                point.accuracy,

            exitLatitude: null,

            exitLongitude: null,

            exitDistance: null,

            endReason: null
        };

        state.activeStop = stop;
        state.candidateStop = null;
        state.nextStopNumber =
            stopNumber + 1;

        emit("tracker:stop-confirmed", {
            stop: clone(stop)
        });

        emit("tracker:marker-add", {
            marker: createMarkerData(stop)
        });
    }


    function cancelCandidate(
        reason = "cancelled",
        details = {}
    ) {
        if (!state.candidateStop) {
            return;
        }

        const candidate =
            clone(state.candidateStop);

        state.candidateStop = null;

        emit("tracker:candidate-cancelled", {
            reason,
            candidate,
            ...details
        });
    }


    // =============================================
    // ACTIVE STOP
    // =============================================

    function processActiveStop(point) {
        const stop = state.activeStop;

        if (!stop) {
            return;
        }

        const distance = calculateDistance(
            stop.latitude,
            stop.longitude,
            point.latitude,
            point.longitude
        );

        emit("tracker:active-stop-position", {
            stop: clone(stop),
            point,
            distance,
            exitRadius:
                config.stopExitRadius
        });

        if (
            distance > config.stopExitRadius
        ) {
            finishActiveStop(
                point,
                "left-stop-radius",
                distance
            );

            // Точка выхода не становится кандидатом
            // немедленно. Следующая GPS-точка начнёт
            // поиск новой остановки.
        }
    }


    function finishActiveStop(
        point,
        reason = "finished",
        knownDistance = null
    ) {
        const stop = state.activeStop;

        if (!stop) {
            return null;
        }

        const endedAt =
            point?.timestamp || Date.now();

        let exitDistance = knownDistance;

        if (
            exitDistance === null &&
            point
        ) {
            exitDistance =
                calculateDistance(
                    stop.latitude,
                    stop.longitude,
                    point.latitude,
                    point.longitude
                );
        }

        stop.endedAt = endedAt;

        stop.duration = Math.max(
            0,
            stop.endedAt -
                stop.startedAt
        );

        stop.status = "completed";
        stop.endReason = reason;

        stop.exitLatitude =
            point?.latitude ?? null;

        stop.exitLongitude =
            point?.longitude ?? null;

        stop.exitDistance =
            Number.isFinite(exitDistance)
                ? Math.round(exitDistance)
                : null;

        state.stops.push({
            ...stop
        });

        state.activeStop = null;

        emit("tracker:stop-finished", {
            stop: clone(stop)
        });

        emit("tracker:marker-update", {
            marker: createMarkerData(stop)
        });

        return stop;
    }


    // =============================================
    // MARKER DATA
    // =============================================

    function createMarkerData(stop) {
        return {
            id: stop.id,

            number: stop.number,

            label: `#${stop.number}`,

            latitude: stop.latitude,

            longitude: stop.longitude,

            startedAt: stop.startedAt,

            confirmedAt: stop.confirmedAt,

            endedAt: stop.endedAt,

            duration: stop.duration,

            status: stop.status
        };
    }


    // =============================================
    // STORAGE
    // =============================================

    function saveState() {
        if (!config.autoSave) {
            return false;
        }

        const data = getState();

        try {
            // Позже storage.js сможет предоставить
            // собственный метод сохранения
            if (
                window.TrackerStorage &&
                typeof window.TrackerStorage
                    .saveState === "function"
            ) {
                window.TrackerStorage.saveState(
                    data
                );

                return true;
            }

            localStorage.setItem(
                config.storageKey,
                JSON.stringify(data)
            );

            return true;
        } catch (error) {
            console.error(
                "Tracker Night save error:",
                error
            );

            emit("tracker:storage-error", {
                operation: "save",
                error
            });

            return false;
        }
    }


    function loadState() {
        try {
            let savedData = null;

            if (
                window.TrackerStorage &&
                typeof window.TrackerStorage
                    .loadState === "function"
            ) {
                savedData =
                    window.TrackerStorage.loadState();
            } else {
                const json =
                    localStorage.getItem(
                        config.storageKey
                    );

                if (json) {
                    savedData =
                        JSON.parse(json);
                }
            }

            if (
                !savedData ||
                typeof savedData !== "object"
            ) {
                return false;
            }

            restoreState(savedData);

            emit("tracker:state-loaded", {
                state: getState()
            });

            return true;
        } catch (error) {
            console.error(
                "Tracker Night load error:",
                error
            );

            emit("tracker:storage-error", {
                operation: "load",
                error
            });

            return false;
        }
    }


    function restoreState(savedData) {
        state.isTracking =
            savedData.isTracking === true;

        state.startedAt =
            savedData.startedAt || null;

        state.stoppedAt =
            savedData.stoppedAt || null;

        state.lastPosition =
            savedData.lastPosition || null;

        state.lastProcessedAt =
            Number(
                savedData.lastProcessedAt
            ) || 0;

        state.candidateStop =
            savedData.candidateStop || null;

        state.activeStop =
            savedData.activeStop || null;

        state.stops =
            Array.isArray(savedData.stops)
                ? savedData.stops
                : [];

        state.nextStopNumber =
            calculateNextStopNumber(
                savedData.nextStopNumber
            );
    }


    function calculateNextStopNumber(
        savedNumber
    ) {
        const numbers = state.stops
            .map((stop) =>
                Number(stop.number)
            )
            .filter(Number.isFinite);

        if (
            state.activeStop &&
            Number.isFinite(
                Number(
                    state.activeStop.number
                )
            )
        ) {
            numbers.push(
                Number(
                    state.activeStop.number
                )
            );
        }

        const calculated =
            numbers.length > 0
                ? Math.max(...numbers) + 1
                : 1;

        const saved =
            Number(savedNumber);

        if (
            Number.isFinite(saved) &&
            saved > calculated
        ) {
            return saved;
        }

        return calculated;
    }


    // =============================================
    // RESET
    // =============================================

    function reset() {
        state.isTracking = false;
        state.startedAt = null;
        state.stoppedAt = null;
        state.lastPosition = null;
        state.lastProcessedAt = 0;
        state.candidateStop = null;
        state.activeStop = null;
        state.stops = [];
        state.nextStopNumber = 1;

        try {
            if (
                window.TrackerStorage &&
                typeof window.TrackerStorage
                    .clearState === "function"
            ) {
                window.TrackerStorage.clearState();
            } else {
                localStorage.removeItem(
                    config.storageKey
                );
            }
        } catch (error) {
            console.error(
                "Tracker Night reset error:",
                error
            );
        }

        emit("tracker:reset", {
            state: getState()
        });
    }


    // =============================================
    // GETTERS
    // =============================================

    function getState() {
        return clone({
            isTracking:
                state.isTracking,

            startedAt:
                state.startedAt,

            stoppedAt:
                state.stoppedAt,

            lastPosition:
                state.lastPosition,

            lastProcessedAt:
                state.lastProcessedAt,

            candidateStop:
                state.candidateStop,

            activeStop:
                state.activeStop,

            stops:
                state.stops,

            nextStopNumber:
                state.nextStopNumber
        });
    }


    function getStops() {
        const stops = [
            ...state.stops
        ];

        if (state.activeStop) {
            stops.push({
                ...state.activeStop
            });
        }

        return clone(stops);
    }


    function getCandidateStop() {
        return clone(
            state.candidateStop
        );
    }


    function getActiveStop() {
        return clone(
            state.activeStop
        );
    }


    // =============================================
    // DISTANCE
    // =============================================

    function calculateDistance(
        latitude1,
        longitude1,
        latitude2,
        longitude2
    ) {
        const earthRadius = 6371000;

        const lat1 =
            degreesToRadians(latitude1);

        const lat2 =
            degreesToRadians(latitude2);

        const latitudeDifference =
            degreesToRadians(
                latitude2 - latitude1
            );

        const longitudeDifference =
            degreesToRadians(
                longitude2 - longitude1
            );

        const a =
            Math.sin(
                latitudeDifference / 2
            ) ** 2 +
            Math.cos(lat1) *
                Math.cos(lat2) *
                Math.sin(
                    longitudeDifference / 2
                ) ** 2;

        const c =
            2 *
            Math.atan2(
                Math.sqrt(a),
                Math.sqrt(1 - a)
            );

        return earthRadius * c;
    }


    function degreesToRadians(degrees) {
        return degrees * Math.PI / 180;
    }


    // =============================================
    // EVENTS
    // =============================================

    function emit(eventName, detail = {}) {
        document.dispatchEvent(
            new CustomEvent(eventName, {
                detail
            })
        );
    }


    // =============================================
    // HELPERS
    // =============================================

    function createStopId() {
        return (
            "stop-" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .slice(2, 8)
        );
    }


    function toNumberOrNull(value) {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return null;
        }

        const number = Number(value);

        return Number.isFinite(number)
            ? number
            : null;
    }


    function clone(value) {
        if (
            value === null ||
            value === undefined
        ) {
            return value;
        }

        return JSON.parse(
            JSON.stringify(value)
        );
    }


    function formatDuration(milliseconds) {
        const totalSeconds = Math.max(
            0,
            Math.floor(
                Number(milliseconds) /
                    1000
            )
        );

        const hours = Math.floor(
            totalSeconds / 3600
        );

        const minutes = Math.floor(
            (totalSeconds % 3600) / 60
        );

        const seconds =
            totalSeconds % 60;

        if (hours > 0) {
            return (
                `${hours} h ` +
                `${minutes} min`
            );
        }

        if (minutes > 0) {
            return (
                `${minutes} min ` +
                `${seconds} sec`
            );
        }

        return `${seconds} sec`;
    }

})();
