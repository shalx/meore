// =====================================
// MEORE v2 PRO
// GPS + Weather + Altitude + Address
// LocalStorage + CSV
// =====================================


let currentData = null;

let savedLocations =
JSON.parse(localStorage.getItem("meore_locations")) || [];


// ================================
// START
// ================================

document.addEventListener("DOMContentLoaded", () => {


renderLocations();


document.getElementById("pin-btn")
.onclick = getLocation;


document.getElementById("save-btn")
.onclick = saveLocation;


document.getElementById("export-btn")
.onclick = exportToCSV;


document.getElementById("load-btn")
.onclick = () =>
document.getElementById("file-input").click();


document.getElementById("file-input")
.onchange = importFromCSV;


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


let lat =
position.coords.latitude;


let lng =
position.coords.longitude;


let accuracy =
position.coords.accuracy;


let speed =
position.coords.speed;


let heading =
position.coords.heading;



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


speed:speed,


heading:heading,


altitude:weather.altitude,


address:address,


temperature:weather.temperature,


humidity:weather.humidity,


windSpeed:weather.windSpeed,


windDirection:weather.windDirection,


pressure:weather.pressure,


rain:weather.rain,


weatherCode:weather.weatherCode,


time:new Date().toLocaleString()


};



showData();



},



error=>{


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
// ALTITUDE + WEATHER
// ================================


async function getWeather(lat,lng){


let result={

altitude:"N/A",
temperature:"N/A",
humidity:"N/A",
windSpeed:"N/A",
windDirection:"N/A",
pressure:"N/A",
rain:"N/A",
weatherCode:"N/A"

};



try{


let altURL =

`https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lng}`;


let altResponse =
await fetch(altURL);


let alt =
await altResponse.json();


result.altitude =
alt.elevation[0];




let url =

`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,pressure_msl,rain,weather_code`;



let response =
await fetch(url);


let data =
await response.json();


let c =
data.current;



result.temperature =
c.temperature_2m;


result.humidity =
c.relative_humidity_2m;


result.windSpeed =
c.wind_speed_10m;


result.windDirection =
c.wind_direction_10m;


result.pressure =
c.pressure_msl;


result.rain =
c.rain;


result.weatherCode =
c.weather_code;



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

Humidity:
${d.humidity} %

Wind:
${d.windSpeed} km/h

Wind direction:
${d.windDirection}°

Pressure:
${d.pressure} hPa

Rain:
${d.rain} mm


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
document.getElementById(
"note-input"
).value;



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
document.getElementById(
"locations-list"
);


if(savedLocations.length===0){

box.innerHTML="Список пуст.";

return;

}



box.innerHTML="";



savedLocations.forEach(x=>{


box.innerHTML +=


`
<div>

<b>${x.note || "Без заметки"}</b><br>

${x.address || "N/A"}<br>

${x.lat},
${x.lng}<br>

Altitude:
${x.altitude || "N/A"} m<br>

Temp:
${x.temperature || "N/A"} °C

<br>

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
savedLocations.filter(
x=>x.id!==id
);



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

return (v===undefined || v===null)
?"N/A"
:v;

}



function exportToCSV(){


if(savedLocations.length===0){

alert("Нет данных");

return;

}



let csv =

"Note,Lat,Lng,Accuracy,Speed,Heading,Altitude,Address,Temp,Humidity,Wind,WindDir,Pressure,Rain,Time\n";



savedLocations.forEach(x=>{


csv +=

`"${safe(x.note)}",
${safe(x.lat)},
${safe(x.lng)},
${safe(x.accuracy)},
${safe(x.speed)},
${safe(x.heading)},
${safe(x.altitude)},
"${safe(x.address)}",
${safe(x.temperature)},
${safe(x.humidity)},
${safe(x.windSpeed)},
${safe(x.windDirection)},
${safe(x.pressure)},
${safe(x.rain)},
"${safe(x.time)}"\n`.replace(/\n/g,"");



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


let lines =
e.target.result.split("\n");


lines.shift();



lines.forEach(line=>{


let c =
line.split(",");



if(c.length<10)return;



savedLocations.push({


id:Date.now()+Math.random(),


note:c[0],


lat:c[1],


lng:c[2],


accuracy:c[3],


speed:c[4],


heading:c[5],


altitude:c[6],


address:c[7],


temperature:c[8],


humidity:c[9],


windSpeed:c[10],


windDirection:c[11],


pressure:c[12],


rain:c[13],


time:c[14]


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
