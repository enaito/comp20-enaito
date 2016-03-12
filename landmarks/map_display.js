//comment back in when in MA
// var myLat = 0;
// var myLng = 0;
var myLat = 42.405;
var myLng = -71.1218;
var myName = "BERNADINE_RYAN";
var request = new XMLHttpRequest();
var me = new google.maps.LatLng(myLat, myLng);
var myOptions = {
            zoom: 14, // The larger the zoom number, the bigger the zoom
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

function init()
{
    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    xhr = new XMLHttpRequest();

    getMyLocation();
}

function getMyLocation() {
    if (navigator.geolocation) { // the navigator.geolocation object is supported on your browser
        navigator.geolocation.getCurrentPosition(function(position) {
            //comment back in when in MA
            //myLat = position.coords.latitude;
            //myLng = position.coords.longitude;
            renderMap();
        });
    }
    else {
        alert("Geolocation is not supported by your web browser.  What a shame!");
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
    
    // Update map and go there...
    map.panTo(me);

    // Create a marker
    marker = new google.maps.Marker({
        position: me,
        title: myName,
        icon: "images/me.png"
    });
    marker.setMap(map);

    google.maps.event.addListener(marker, 'click', function() {
    	infowindow.setContent(marker.title + " " + closestLandmark.properties.Location_Name);
    	infowindow.open(map,marker);
 	});
        
    // Open info window on click of marker
    // google.maps.event.addListener(marker, 'click', function() {
    //     infowindow.setContent(marker.title);
    //     infowindow.open(map, marker);
    // });	

	
}

function displayPeople() {
	var myPos = {lat: myLat, lng: myLng};
	for (i = 0; i < vals.people.length; i++) {
		var pos = {lat: vals.people[i].lat, lng: vals.people[i].lng};
		pMark = new google.maps.Marker({
			position: pos,
			title: vals.people[i].login,
			icon: "images/you.png",
			content: vals.people[i].login + "<br>Distance: " + distanceBetween(pos, myPos),
			map: map
		});

		google.maps.event.addListener(pMark, 'click', (function(pMark, i) {
        	return function() {
          		infowindow.setContent(this.content);
          		infowindow.open(this.getMap(), this);
        }
      })(marker, i));
	}

}

function displayLandmarks() {
	for (i = 0; i < vals.landmarks.length; i++) {
		lMark = new google.maps.Marker({
			position: {lat: vals.landmarks[i].geometry.coordinates[1], lng: vals.landmarks[i].geometry.coordinates[0]},
			title: vals.landmarks[i].properties.Location_Name,
			icon: "images/place.png",
			content: vals.landmarks[i].properties.Details,
			map: map
		});

		google.maps.event.addListener(lMark, 'click', (function(lMark, i) {
        	return function() {
          		infowindow.setContent(this.content);
          		infowindow.open(this.getMap(), this);
        }
      })(marker, i));
	}
}

function findClosestLandmark() {
	var myPos = {lat: myLat, lng: myLng};
	var pos = {lat: vals.landmarks[0].geometry.coordinates[1], lng: vals.landmarks[0].geometry.coordinates[0]};
	var currClose = distanceBetween(pos, myPos);
	var currCloseL = vals.landmarks[0];
	var compClose;
	for (i = 1; i < vals.landmarks.length; i++) {
		compClose = {lat: vals.landmarks[i].geometry.coordinates[1], lng: vals.landmarks[i].geometry.coordinates[0]};
		if (compClose < currClose) {
			currClose = compClose;
			currCloseL = vals.landmarks[i];
		}
	}
	return currCloseL;
}

function toRad(x) {
   return x * Math.PI / 180;
}

function distanceBetween(locA, locB) {
	var lat1 = locA.lat; 
	var lng1 = locA.lng; 
	var lat2 = locB.lat; 
	var lng2 = locB.lng; 

	var R = 6371;
	var x1 = lat2-lat1;
	var dLat = toRad(x1);  
	var x2 = lng2-lng1;
	var dLng = toRad(x2);  
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
	        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
	        Math.sin(dLng/2) * Math.sin(dLng/2);  
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	return R * c; 
}





