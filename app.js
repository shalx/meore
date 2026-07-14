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


    navigator.geolocation.getCurrentPosition(

    async position => {


        let lat = position.coords.latitude;

        let lng = position.coords.longitude;

        let accuracy = position.coords.accuracy;


        display.innerText =
        "Получение данных...";


        let weather =
        await getWeather(lat,lng);


        let address =
        await getAddress(lat,lng);



        currentData = {

            lat:lat,

            lng:lng,

            accuracy:accuracy,

            altitude:weather.altitude,

            address:address,

            temperature:weather.temperature,

            windSpeed:weather.windSpeed,

            time:new Date().toLocaleString()

        };


        showData();


    },


    error => {

        display.innerText =
        "Ошибка GPS";

    },


    {
        enableHighAccuracy:true,
        timeout:15000,
        maximumAge:0
    }

    );

}



// ================================
// WEATHER + ALTITUDE
// ================================

async function getWeather(lat,lng){


let result = {

    altitude:"N/A",

    temperature:"N/A",

    windSpeed:"N/A"

};


try{


// altitude

let altURL =

`https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lng}`;


let altResponse =
await fetch(altURL);


let altData =
await altResponse.json();


result.altitude =
altData.elevation[0];



// weather

let url =

`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,wind_speed_10m`;


let response =
await fetch(url);


let data =
await response.json();


let c =
data.current;


result.temperature =
c.temperature_2m;


result.windSpeed =
c.wind_speed_10m;


}

catch(e){

console.log(e);

}


return result;


}



// ================================
// ADDRESS
// ================================

async function getAddress(lat,lng){


try{


let url =

`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&accept-language=en`;



let response =
await fetch(url);


let data =
await response.json();


return data.display_name || "N/A";


}

catch(e){

return "N/A";

}


}



// ================================
// DISPLAY
// ================================

function showData(){


let d=currentData;


document.getElementById(
"coordinates-display"
).innerHTML =


`
Latitude:
${d.lat.toFixed(6)}

Longitude:
${d.lng.toFixed(6)}

Accuracy:
${Math.round(d.accuracy)} m


Altitude:
${d.altitude} m


Address:
${d.address}


Temperature:
${d.temperature} °C


Wind:
${d.windSpeed} km/h


Time:
${d.time}

`;

}


// ================================
// SAVE
// ================================

function saveLocation(){


if(!currentData){

alert("Сначала нажмите PIN");

return;

}



let note =
document.getElementById("note-input").value;



savedLocations.push({

id:Date.now(),

note:note,

...currentData

});



localStorage.setItem(

"meore_locations",

JSON.stringify(savedLocations)

);



document.getElementById(
"note-input"
).value="";


renderLocations();


}



// ================================
// LIST
// ================================

function renderLocations(){


let box =
document.getElementById("locations-list");


if(savedLocations.length===0){

box.innerHTML =
"Список пуст.";

return;

}



box.innerHTML="";


savedLocations.forEach(x=>{


box.innerHTML +=


`
<div>

<b>${x.note || "Без заметки"}</b><br>

${x.address || "N/A"}<br>

Lat:
${x.lat}<br>

Lng:
${x.lng}<br>

Altitude:
${x.altitude} m<br>

Temp:
${x.temperature} °C<br>

Wind:
${x.windSpeed} km/h<br>

${x.time}

<br>

<button onclick="deleteLocation(${x.id})">
DELETE
</button>

<hr>

</div>

`;

});


}



function deleteLocation(id){


savedLocations =
savedLocations.filter(x=>x.id!==id);


localStorage.setItem(

"meore_locations",

JSON.stringify(savedLocations)

);


renderLocations();

}



// ================================
// CSV EXPORT
// ================================

function safe(v){

if(v===undefined || v===null)
return "N/A";

return v;

}



function exportToCSV(){


if(savedLocations.length===0){

alert("Нет данных");

return;

}


let csv =

"Note,Lat,Lng,Accuracy,Altitude,Address,Temperature,Wind,Time\n";



savedLocations.forEach(x=>{


csv +=

`"${safe(x.note)}",${safe(x.lat)},${safe(x.lng)},${safe(x.accuracy)},${safe(x.altitude)},"${safe(x.address)}",${safe(x.temperature)},${safe(x.windSpeed)},"${safe(x.time)}"\n`;

});



let blob =
new Blob(
[csv],
{
type:"text/csv;charset=utf-8"
}
);


let a =
document.createElement("a");


a.href =
URL.createObjectURL(blob);


a.download =
"meore_locations.csv";


a.click();


}



// ================================
// CSV IMPORT
// ================================

function importFromCSV(event){


let file =
event.target.files[0];


if(!file)return;



let reader =
new FileReader();



reader.onload=function(e){


let rows =
e.target.result.split("\n");


rows.shift();



rows.forEach(line=>{


let c=line.split(",");


if(c.length<9)return;



savedLocations.push({

id:Date.now()+Math.random(),

note:c[0],

lat:c[1],

lng:c[2],

accuracy:c[3],

altitude:c[4],

address:c[5],

temperature:c[6],

windSpeed:c[7],

time:c[8]

});


});



localStorage.setItem(

"meore_locations",

JSON.stringify(savedLocations)

);



renderLocations();


alert("CSV загружен");


};


reader.readAsText(file);


}
