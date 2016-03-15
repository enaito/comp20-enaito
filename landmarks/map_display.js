var myLat = 0;
var myLng = 0;
var myName = "BERNADINE_RYAN";
var request = new XMLHttpRequest();
var me = new google.maps.LatLng(myLat, myLng);
var myOptions = {
    zoom: 14,
    center: me,
    mapTypeId: google.maps.MapTypeId.ROADMAP
};
var map;
var marker;
var pMark;
var lMark;
var infowindow = new google.maps.InfoWindow();
var xhr;
var closestLandmark;
var pathToLandmark;

function init()
{
    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    xhr = new XMLHttpRequest();
    getMyLocation();
}

function getMyLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            myLat = position.coords.latitude;
            myLng = position.coords.longitude;
            renderMap();
        });
    }
    else {
        alert("Geolocation is not supported by your web browser.");
    }
}

function renderMap()
{
	xhr.open("POST", "https://defense-in-derpth.herokuapp.com/sendLocation", true)
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4 && xhr.status == 200) {
			data = xhr.responseText;
			vals = JSON.parse(data);
			displayPeople();
			displayLandmarks();
			closestLandmark = findClosestLandmark();
		}
	};
	xhr.send("login=" + myName + "&lat=" + myLat + "&lng=" + myLng);

    me = new google.maps.LatLng(myLat, myLng);
    map.panTo(me);

    marker = new google.maps.Marker({
        position: me,
        title: myName,
        icon: "images/me.png"
    });
    marker.setMap(map);

    google.maps.event.addListener(marker, 'click', function() {
    	infowindow.setContent("<span class='title'>Name: </span>" + marker.title + 
    						  "<br><span class='title'>Closest Landmark: </span>" + 
    						  closestLandmark.landmark.properties.Location_Name + 
    						  "<br><span class='title'>Landmark Distance: </span>" + 
    						  closestLandmark.distance + " mi");
    	infowindow.open(map,marker);
    	pathToLandmark.setMap(map);
 	});

 	google.maps.event.addListener(infowindow,'closeclick',function(){
		pathToLandmark.setMap(null);
	});
 }

function displayPeople() {
	var myPos = {lat: myLat, lng: myLng};
	for (i = 0; i < vals.people.length; i++) {
		if (vals.people[i].login == myName) {
			continue;	// don't display me twice (as classmate and me)
		}
		var pos = {lat: vals.people[i].lat, lng: vals.people[i].lng};
		pMark = new google.maps.Marker({
			position: pos,
			title: vals.people[i].login,
			icon: "images/you.png",
			content: "<span class='title'>Name: </span>" + 
					  vals.people[i].login + 
					  "<br><span class='title'>Distance: </span>" + 
					  distanceBetween(pos, myPos) + " mi",
			map: map
		});

		google.maps.event.addListener(pMark, 'click', (function(pMark, i) {
        	return function() {
        		pathToLandmark.setMap(null);
          		infowindow.setContent(this.content);
          		infowindow.open(this.getMap(), this);
        	}
      	})(pMark, i));
	}

}

function displayLandmarks() {										// at the indicated position
	for (i = 0; i < vals.landmarks.length; i++) {
		lMark = new google.maps.Marker({
			position: {lat: vals.landmarks[i].geometry.coordinates[1], 
					   lng: vals.landmarks[i].geometry.coordinates[0]},
			title: vals.landmarks[i].properties.Location_Name,
			icon: "images/place",
			content: vals.landmarks[i].properties.Details,
			map: map
		});

		google.maps.event.addListener(lMark, 'click', (function(lMark, i) {
        	return function() {
        		pathToLandmark.setMap(null);
          		infowindow.setContent(this.content);
          		infowindow.open(this.getMap(), this);
        	}
      	})(lMark, i));
	}
}

function findClosestLandmark() {
	var myPos = {lat: myLat, lng: myLng};
	var pos = {lat: vals.landmarks[0].geometry.coordinates[1], 
			   lng: vals.landmarks[0].geometry.coordinates[0]};
	var currClose = distanceBetween(pos, myPos);
	var currCloseL = vals.landmarks[0];
	var compClose;
	
	for (i = 1; i < vals.landmarks.length; i++) {
		compClose = {lat: vals.landmarks[i].geometry.coordinates[1], 
					 lng: vals.landmarks[i].geometry.coordinates[0]};
		if (compClose < currClose) {
			currClose = compClose;
			currCloseL = vals.landmarks[i];
		}
	}

    pathToLandmark = new google.maps.Polyline({
    	path: [{lat: myLat, lng: myLng}, 
    		   {lat: currCloseL.geometry.coordinates[1], 
    		   	lng: currCloseL.geometry.coordinates[0]}],
    	geodesic: true,
    	strokeColor: '#FF0000',
    	strokeOpacity: 1.0,
    	strokeWeight: 2
  	});
	
	return {landmark: currCloseL, distance: currClose};
}

function distanceBetween(locA, locB) {
	var lat1 = locA.lat; 
	var lng1 = locA.lng; 
	var lat2 = locB.lat; 
	var lng2 = locB.lng; 

	var R = 6371;	//km
	var x1 = lat2-lat1;
	var dLat = toRad(x1);  
	var x2 = lng2-lng1;
	var dLng = toRad(x2);  
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
	        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
	        Math.sin(dLng/2) * Math.sin(dLng/2);  
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var distMi = (R * c) / 1.60934;	//convert to miles
	distMi = Math.round(distMi * 1000) / 1000;	// round to 3 decimal pts

	return distMi;
}

function toRad(x) {
   return x * Math.PI / 180;
}




