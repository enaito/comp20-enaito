//comment back in when in MA
// var myLat = 0;
// var myLng = 0;
var myLat = 42.405;
var myLng = -71.1218;
var request = new XMLHttpRequest();
var me = new google.maps.LatLng(myLat, myLng);
var myOptions = {
            zoom: 13, // The larger the zoom number, the bigger the zoom
            center: me,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
var map;
var marker;
var infowindow = new google.maps.InfoWindow();
var xhr;

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
    me = new google.maps.LatLng(myLat, myLng);
    
    // Update map and go there...
    map.panTo(me);

    // Create a marker
  var image = "images/me.png";
    marker = new google.maps.Marker({
        position: me,
        title: "Here I Am!",
        icon: image
    });
    marker.setMap(map);
        
    // Open info window on click of marker
    google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent(marker.title);
        infowindow.open(map, marker);
    });

	xhr.open("POST", "https://defense-in-derpth.herokuapp.com/sendLocation", true)
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4 && xhr.status == 200) {
			data = xhr.responseText;
			vals = JSON.parse(data);
			console.log(vals);
			for (i = 0; i < vals.landmarks.length; i++) {
				console.log(vals.landmarks[i].properties.Location_Name);
			}
		}
	};
	xhr.send("login=BERNADINE_RYAN&lat=" + myLat + "&lng=" + myLng);
}





