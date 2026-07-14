// =====================================
// MEORE v2.1 PRO
// GPS + Altitude + Address + Weather
// Simple version
// =====================================

let currentData = null;

let savedLocations = JSON.parse(localStorage.getItem("meore_locations")) || [];


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

    let display = document.getElementById("coordinates-display");

    display.innerHTML = "Receiving GPS...";


    if(!navigator.geolocation){

        display.innerHTML = "GPS not supported";
        return;

    }


    navigator.geolocation.getCurrentPosition(

    async position => {


        let lat = position.coords.latitude;

        let lng = position.coords.longitude;

        let accuracy = position.coords.accuracy;


        display.innerHTML = "Getting data...";


        let weather = await getWeather(lat,lng);

        let address = await getAddress(lat,lng);



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

        display.innerHTML =
        "GPS Error: " + error.message;

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


    try {


        let url =
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,wind_speed_10m&timezone=auto`;


        let response = await fetch(url);

        let data = await response.json();



        if(data.elevation){

            result.altitude =
            Math.round(data.elevation);

        }



        if(data.current){


            result.temperature =
            data.current.temperature_2m;


            result.windSpeed =
            data.current.wind_speed_10m;


        }



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


    try {


        let url =
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`;



        let response = await fetch(url);


        let data = await response.json();



        return data.display_name || "N/A";


    }

    catch(e){


        console.log(e);

        return "N/A";


    }


}



// ================================
// DISPLAY
// ================================

function showData(){


    let d=currentData;


    document.getElementById("coordinates-display").innerHTML = `


    Latitude: ${d.lat.toFixed(6)}<br>

    Longitude: ${d.lng.toFixed(6)}<br>

    Accuracy: ${Math.round(d.accuracy)} m<br>

    Altitude: ${d.altitude} m<br>

    Address: ${d.address}<br>

    Temperature: ${d.temperature} °C<br>

    Wind: ${d.windSpeed} km/h<br>

    Time: ${d.time}


    `;


}



// ================================
// SAVE
// ================================

function saveLocation(){


    if(!currentData){

        alert("First press PIN");

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



    document.getElementById("note-input").value="";


    renderLocations();


}



// ================================
// LIST
// ================================

function renderLocations(){


    let box =
    document.getElementById("locations-list");



    if(savedLocations.length===0){

        box.innerHTML="List is empty.";

        return;

    }



    box.innerHTML="";



    savedLocations.forEach(x=>{


        box.innerHTML += `


        <div>


        <b>${x.note || "Without note"}</b><br>


        ${x.address || "N/A"}<br>


        Lat: ${x.lat}<br>

        Lng: ${x.lng}<br>


        Accuracy: ${x.accuracy} m<br>


        Altitude: ${x.altitude} m<br>


        Temp: ${x.temperature} °C<br>


        Wind: ${x.windSpeed} km/h<br>


        ${x.time}<br><br>



        <button onclick="goToLocation(${x.lat},${x.lng})">
        MAP
        </button>


        <button onclick="deleteLocation(${x.id})">
        DELETE
        </button>



        <hr>


        </div>


        `;


    });


}



// ================================
// DELETE
// ================================

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

        alert("No data");

        return;

    }



    let csv =

`Note,Lat,Lng,Accuracy,Altitude,Address,Temperature,Wind,Time\n`;



    savedLocations.forEach(x=>{


        csv +=

`"${safe(x.note)}",${safe(x.lat)},${safe(x.lng)},${safe(x.accuracy)},${safe(x.altitude)},"${safe(x.address)}",${safe(x.temperature)},${safe(x.windSpeed)},"${safe(x.time)}"\n`;


    });



    let blob =
    new Blob([csv],
    {type:"text/csv;charset=utf-8"});



    let a=document.createElement("a");


    a.href=
    URL.createObjectURL(blob);


    a.download="meore_locations.csv";


    a.click();


}



// ================================
// CSV IMPORT
// ================================

function importFromCSV(event){


    let file =
    event.target.files[0];


    if(!file)return;



    let reader=new FileReader();



    reader.onload=function(e){


        let lines =
        e.target.result.split("\n");


        lines.shift();



        lines.forEach(line=>{


            if(!line.trim())return;



            let c =
            line.split(",");



            if(c.length<9)return;



            savedLocations.push({

                id:Date.now()+Math.random(),


                note:c[0].replace(/"/g,""),


                lat:parseFloat(c[1]),


                lng:parseFloat(c[2]),


                accuracy:c[3],


                altitude:c[4],


                address:c[5].replace(/"/g,""),


                temperature:c[6],


                windSpeed:c[7],


                time:c[8].replace(/"/g,"")


            });



        });



        localStorage.setItem(

        "meore_locations",

        JSON.stringify(savedLocations)

        );



        renderLocations();


        alert("CSV uploaded");


    };



    reader.readAsText(file);


}



// ================================
// GOOGLE MAPS
// ================================

function goToLocation(lat,lng){


    let url =
    `https://www.google.com/maps?q=${lat},${lng}`;


    window.location.href=url;


}
