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
// =====================================
// FIND BACKUP FILE
// =====================================

async function findBackupFile() {

    const accessToken =
        await getGoogleAccessToken();

    const query =
        encodeURIComponent(
            "name='meore_backup.json' and trashed=false"
        );

    const url =
        "https://www.googleapis.com/drive/v3/files" +
        "?spaces=appDataFolder" +
        `&q=${query}` +
        "&pageSize=1" +
        "&fields=files(id,name,modifiedTime)";

    const response = await fetch(url, {

        headers: {

            Authorization:
                `Bearer ${accessToken}`

        }

    });

    if (!response.ok) {

        const errorText =
            await response.text();

        throw new Error(
            `Ошибка Drive API ${response.status}: ${errorText}`
        );

    }

    const result =
        await response.json();

    if (
        !result.files ||
        result.files.length === 0
    ) {

        console.log(
            "Резервная копия пока не найдена."
        );

        return null;

    }

    console.log(
        "Резервная копия найдена:",
        result.files[0]
    );

    return result.files[0];

}
// =====================================
// BACKUP SETTINGS
// =====================================

const BACKUP_FILE_NAME =
    "meore_backup.json";


// =====================================
// GET LOCAL LOCATIONS
// =====================================

function getLocationsForBackup() {

    try {

        const savedData =
            localStorage.getItem(
                "meore_locations"
            );

        if (!savedData) {

            return [];

        }

        const parsedData =
            JSON.parse(savedData);

        return Array.isArray(parsedData)
            ? parsedData
            : [];

    } catch (error) {

        console.error(
            "Ошибка чтения локальных точек:",
            error
        );

        return [];

    }

}


// =====================================
// CREATE BACKUP DATA
// =====================================

function createBackupData() {

    return {

        version: 1,

        app: "Meore Free",

        updatedAt:
            new Date().toISOString(),

        locations:
            getLocationsForBackup()

    };

}


// =====================================
// CREATE BACKUP FILE
// =====================================

async function createBackupFile(
    backupData
) {

    const accessToken =
        await getGoogleAccessToken();

    const metadata = {

        name: BACKUP_FILE_NAME,

        mimeType:
            "application/json",

        parents: [
            "appDataFolder"
        ]

    };

    const formData =
        new FormData();

    formData.append(

        "metadata",

        new Blob(

            [
                JSON.stringify(metadata)
            ],

            {
                type:
                    "application/json"
            }

        )

    );

    formData.append(

        "file",

        new Blob(

            [
                JSON.stringify(
                    backupData,
                    null,
                    2
                )
            ],

            {
                type:
                    "application/json"
            }

        )

    );

    const response = await fetch(

        "https://www.googleapis.com/upload/drive/v3/files" +
        "?uploadType=multipart" +
        "&fields=id,name,modifiedTime",

        {

            method: "POST",

            headers: {

                Authorization:
                    `Bearer ${accessToken}`

            },

            body: formData

        }

    );

    if (!response.ok) {

        const errorText =
            await response.text();

        throw new Error(
            `Ошибка создания backup: ${response.status} ${errorText}`
        );

    }

    const createdFile =
        await response.json();

    console.log(
        "Резервная копия создана:",
        createdFile
    );

    return createdFile;

}


// =====================================
// UPDATE BACKUP FILE
// =====================================

async function updateBackupFile(
    fileId,
    backupData
) {

    const accessToken =
        await getGoogleAccessToken();

    const response = await fetch(

        "https://www.googleapis.com/upload/drive/v3/files/" +
        encodeURIComponent(fileId) +
        "?uploadType=media" +
        "&fields=id,name,modifiedTime",

        {

            method: "PATCH",

            headers: {

                Authorization:
                    `Bearer ${accessToken}`,

                "Content-Type":
                    "application/json"

            },

            body: JSON.stringify(
                backupData,
                null,
                2
            )

        }

    );

    if (!response.ok) {

        const errorText =
            await response.text();

        throw new Error(
            `Ошибка обновления backup: ${response.status} ${errorText}`
        );

    }

    const updatedFile =
        await response.json();

    console.log(
        "Резервная копия обновлена:",
        updatedFile
    );

    return updatedFile;

}


// =====================================
// BACKUP TO GOOGLE DRIVE
// =====================================

async function backupToDrive() {

    try {

        console.log(
            "Запуск резервного копирования..."
        );

        const backupData =
            createBackupData();

        const existingFile =
            await findBackupFile();

        if (existingFile) {

            await updateBackupFile(

                existingFile.id,

                backupData

            );

        } else {

            await createBackupFile(
                backupData
            );

        }

        console.log(
            "Google Drive backup completed."
        );

        return true;

    } catch (error) {

        console.error(
            "Ошибка резервного копирования:",
            error
        );

        alert(
            "Не удалось сохранить резервную копию в Google Drive.\n\n" +
            error.message
        );

        return false;

    }

}
// =====================================
// DOWNLOAD BACKUP
// =====================================

async function downloadBackupFile(fileId) {

    const accessToken =
        await getGoogleAccessToken();

    const response = await fetch(

        "https://www.googleapis.com/drive/v3/files/" +
        fileId +
        "?alt=media",

        {

            headers: {

                Authorization:
                    `Bearer ${accessToken}`

            }

        }

    );

    if (!response.ok) {

        throw new Error(
            "Не удалось скачать резервную копию."
        );

    }

    return await response.json();

}
// =====================================
// RESTORE FROM DRIVE
// =====================================

async function restoreFromDrive() {

    try {

        const file =
            await findBackupFile();

        if (!file) {

            return false;

        }

        const backup =
            await downloadBackupFile(
                file.id
            );

        if (!backup.locations) {

            return false;

        }

        localStorage.setItem(

            "meore_locations",

            JSON.stringify(
                backup.locations
            )

        );

        alert(
            "Резервная копия восстановлена."
        );

        return true;

    }

    catch(error){

        console.error(error);

        return false;

    }

}
const savedLocations = MeoreStorage.getAll();




}
