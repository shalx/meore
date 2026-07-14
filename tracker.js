let tracking=false;

let watchID=null;

let points=0;

let distance=0;

let lastPosition=null;



document.getElementById("start-btn").onclick=startTracker;

document.getElementById("stop-btn").onclick=stopTracker;



function startTracker(){


if(tracking)return;


tracking=true;


document.getElementById("status").innerHTML=
"TRACKER ACTIVE";



watchID=navigator.geolocation.watchPosition(

positionUpdate,


error=>{

document.getElementById("status").innerHTML=
"GPS ERROR";

},


{

enableHighAccuracy:true,

maximumAge:0,

timeout:10000

}


);


}




function stopTracker(){


tracking=false;


if(watchID){

navigator.geolocation.clearWatch(watchID);

}


document.getElementById("status").innerHTML=
"TRACKER STOPPED";


}




function positionUpdate(position){


let lat=
position.coords.latitude;


let lng=
position.coords.longitude;



points++;



if(lastPosition){


distance += calculateDistance(

lastPosition.lat,

lastPosition.lng,

lat,

lng

);


}



lastPosition={

lat:lat,

lng:lng

};



document.getElementById("points").innerHTML=
points;



document.getElementById("distance").innerHTML=
distance.toFixed(1);



document.getElementById("time").innerHTML=
new Date().toLocaleTimeString();


}





function calculateDistance(lat1,lon1,lat2,lon2){


let R=6371000;


let dLat=(lat2-lat1)*Math.PI/180;

let dLon=(lon2-lon1)*Math.PI/180;



let a=

Math.sin(dLat/2)**2+

Math.cos(lat1*Math.PI/180)*

Math.cos(lat2*Math.PI/180)*

Math.sin(dLon/2)**2;



return R*2*Math.atan2(

Math.sqrt(a),

Math.sqrt(1-a)

);


}




function goBack(){

window.location.href="index.html";

}
