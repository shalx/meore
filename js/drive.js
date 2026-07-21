"use strict";

/*
=========================================
MEORE FREE
drive.js
Google Drive Authorization
=========================================
*/


// =====================================
// GOOGLE CONFIG
// =====================================

const GOOGLE_CLIENT_ID =
    "671972605175-ddet59hcf0upqrcc5r10h2s9l14qo1ru.apps.googleusercontent.com";

const GOOGLE_DRIVE_SCOPE =
    "https://www.googleapis.com/auth/drive.appdata";


// =====================================
// GLOBAL
// =====================================

let googleTokenClient = null;
let googleAccessToken = null;
let googleTokenExpiresAt = 0;


// =====================================
// START
// =====================================

window.addEventListener(
    "load",
    initializeGoogleDrive
);


function initializeGoogleDrive() {

    if (
        typeof google === "undefined" ||
        !google.accounts ||
        !google.accounts.oauth2
    ) {

        console.error(
            "Google Identity Services не загрузился."
        );

        return;

    }


    googleTokenClient =
        google.accounts.oauth2.initTokenClient({

            client_id: GOOGLE_CLIENT_ID,

            scope: GOOGLE_DRIVE_SCOPE,

            callback: handleGoogleTokenResponse,

            error_callback: handleGoogleAuthError

        });


    console.log(
        "Google Drive authorization initialized."
    );

}


// =====================================
// AUTHORIZE
// =====================================

function authorizeGoogleDrive() {

    return new Promise((resolve, reject) => {

        if (!googleTokenClient) {

            reject(
                new Error(
                    "Google Drive ещё не инициализирован."
                )
            );

            return;

        }


        googleTokenClient.callback = response => {

            if (response.error) {

                reject(
                    new Error(response.error)
                );

                return;

            }


            googleAccessToken =
                response.access_token;

            const expiresIn =
                Number(response.expires_in || 3600);


            googleTokenExpiresAt =
                Date.now() +
                expiresIn * 1000 -
                60000;


            console.log(
                "Google Drive authorization successful."
            );


            resolve(googleAccessToken);

        };


        googleTokenClient.requestAccessToken({

            prompt:
                googleAccessToken
                    ? ""
                    : "consent"

        });

    });

}


// =====================================
// TOKEN
// =====================================

async function getGoogleAccessToken() {

    const tokenIsValid =
        googleAccessToken &&
        Date.now() < googleTokenExpiresAt;


    if (tokenIsValid) {

        return googleAccessToken;

    }


    return authorizeGoogleDrive();

}


// =====================================
// DEFAULT CALLBACK
// =====================================

function handleGoogleTokenResponse(response) {

    if (response.error) {

        console.error(
            "Google authorization error:",
            response.error
        );

        return;

    }


    googleAccessToken =
        response.access_token;


    const expiresIn =
        Number(response.expires_in || 3600);


    googleTokenExpiresAt =
        Date.now() +
        expiresIn * 1000 -
        60000;


    console.log(
        "Google Drive access token received."
    );

}


// =====================================
// AUTH ERROR
// =====================================

function handleGoogleAuthError(error) {

    console.error(
        "Google authorization failed:",
        error
    );

}


// =====================================
// CONNECTION TEST
// =====================================

async function testGoogleDriveConnection() {

    try {

        const accessToken =
            await getGoogleAccessToken();


        const response = await fetch(

            "https://www.googleapis.com/drive/v3/files" +
            "?spaces=appDataFolder" +
            "&pageSize=1" +
            "&fields=files(id,name)",

            {

                headers: {

                    Authorization:
                        `Bearer ${accessToken}`

                }

            }

        );


        if (!response.ok) {

            const errorText =
                await response.text();


            throw new Error(
                `Drive API error ${response.status}: ${errorText}`
            );

        }


        const data =
            await response.json();


        console.log(
            "Google Drive connection works:",
            data
        );


        alert(
            "Google Drive успешно подключён."
        );


        return true;

    } catch (error) {

        console.error(
            "Google Drive test failed:",
            error
        );


        alert(
            "Не удалось подключить Google Drive.\n\n" +
            error.message
        );


        return false;

    }

}


// =====================================
// DISCONNECT
// =====================================

function disconnectGoogleDrive() {

    if (!googleAccessToken) {

        return;

    }


    google.accounts.oauth2.revoke(

        googleAccessToken,

        () => {

            googleAccessToken = null;
            googleTokenExpiresAt = 0;

            console.log(
                "Google Drive disconnected."
            );

        }

    );

}
