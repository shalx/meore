// =================================
// MEORE v2 PRO
// GPS + Weather + Altitude + CSV
// =================================


let currentData = null;


let savedLocations =
JSON.parse(localStorage.getItem("meore_locations")) || [];


// ================================
// START
// ================================

document.addEventListener("DOMContentLoaded", () => {

    renderLocations();


    document
    .getElementById("pin-btn")
    .onclick = getLocation;


    document
    .getElementById("save-btn")
    .onclick = saveLocation;


    document
    .getElementById("export-btn")
    .onclick = exportToCSV;


    document
    .getElementById("load-btn")
    .onclick = () =>
        document.getElementById("file-input").click();


    document
    .getElementById("file-input")
    .onchange = importFromCSV;

});



// ================================
// GPS
// ================================

function getLocation(){

const display =
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
"Получение погоды...";



let weather =
await getWeather(lat,lng);



currentData = {

lat: lat,

lng: lng,

accuracy: accuracy,

speed: speed,

heading: heading,

altitude: weather.altitude,

temperature: weather.temperature,

humidity: weather.humidity,

windSpeed: weather.windSpeed,

windDirection: weather.windDirection,

pressure: weather.pressure,

rain: weather.rain,

weatherCode: weather.weatherCode,

time: new Date().toLocaleString()

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
// OPEN METEO
// ================================


async function getWeather(lat,lng){


let result = {

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


// altitude

let altURL =
`https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lng}`;


let altResponse =
await fetch(altURL);


let altJSON =
await altResponse.json();


result.altitude =
altJSON.elevation[0];



// weather


let weatherURL =

`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,pressure_msl,rain,weather_code`;



let response =
await fetch(weatherURL);


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
// DISPLAY
// ================================


function showData(){


let d=currentData;


document.getElementById(
"coordinates-display"
)
.innerHTML =

`
Latitude : ${d.lat.toFixed(6)}

Longitude: ${d.lng.toFixed(6)}

Accuracy : ${Math.round(d.accuracy)} m

Altitude : ${d.altitude} m


Temperature : ${d.temperature} °C

Humidity : ${d.humidity} %

Wind : ${d.windSpeed} km/h

Wind direction : ${d.windDirection}°

Pressure : ${d.pressure} hPa

Rain : ${d.rain} mm


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



let item = {

id:Date.now(),

note:note,

...currentData

};



savedLocations.push(item);



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

${x.lat},
${x.lng}<br>

Altitude:
${x.altitude} m<br>

Temp:
${x.temperature} °C<br>

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


function exportToCSV(){


if(savedLocations.length===0){

alert("Нет данных");

return;

}



let csv =

"Note,Lat,Lng,Accuracy,Speed,Heading,Altitude,Temp,Humidity,Wind,WindDir,Pressure,Rain,Time\n";



savedLocations.forEach(x=>{


csv +=

`"${x.note}",${x.lat},${x.lng},${x.accuracy},${x.speed},${x.heading},${x.altitude},${x.temperature},${x.humidity},${x.windSpeed},${x.windDirection},${x.pressure},${x.rain},"${x.time}"\n`;

});



let blob =
new Blob(
[csv],
{type:"text/csv"}
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


let c=line.split(",");


if(c.length<10)return;



savedLocations.push({

id:Date.now()+Math.random(),

note:c[0],

lat:Number(c[1]),

lng:Number(c[2]),

accuracy:c[3],

speed:c[4],

heading:c[5],

altitude:c[6],

temperature:c[7],

humidity:c[8],

windSpeed:c[9],

windDirection:c[10],

pressure:c[11],

rain:c[12],

time:c[13]

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
