// =====================================
// MEORE v2.1 PRO
// GPS + Altitude + Address + Weather
// Simple version
// =====================================

let currentData = null;

let savedLocations =
JSON.parse(localStorage.getItem("meore_locations")) || [];


// ================================
// START
// ================================

document.addEventListener("DOMContentLoaded", () => {

    renderLocations();

    document.getElementById("pin-btn").onclick = getLocation;

    document.getElementById("save-btn").onclick = saveLocation;

    document.getElementById("export-btn").onclick = exportToCSV;

    document.getElementById("load-btn").onclick = () =>
        document.getElementById("file-input").click();

    document.getElementById("file-input").onchange = importFromCSV;

});


// ================================
// GPS
// ================================

function getLocation(){

    let display =
    document.getElementById("coordinates-display");

    display.innerText =
    "Получение GPS...";
    "Receiving GPS...";


    navigator.geolocation.getCurrentPosition(
@@ -58,7 +58,7 @@


        display.innerText =
        "Получение данных...";
        "Getting data...";


        let weather =
@@ -100,7 +100,7 @@
    error => {

        display.innerText =
        "Ошибка GPS";
        "GPS error";

    },

@@ -300,7 +300,7 @@

if(!currentData){

alert("Сначала нажмите PIN");
alert("First press PIN");

return;

@@ -381,7 +381,7 @@
`
<div>

<b>${x.note || "Без заметки"}</b><br>
<b>${x.note || "Without a note"}</b><br>

${x.address || "N/A"}<br>

@@ -463,7 +463,7 @@

if(savedLocations.length===0){

alert("Нет данных");
alert("No data");

return;

@@ -598,7 +598,7 @@
renderLocations();


alert("CSV загружен");
alert("CSV uploaded");


};
