var geocoder;
var map;
function initialize() {
  geocoder = new google.maps.Geocoder();
  var latlng = new google.maps.LatLng(28.4158, -81.2989);
  var mapOptions = {
    zoom: 8,
    center: latlng
  }
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
}

// Runs the SeatGeek api, and returns a list of 25 events near the city the user inputted (after geocoding).
searchSeatGeek = function(lat,lng) {
	var customURL = 'http://api.seatgeek.com/2/events?per_page=25&lat=' +lat+ '&lon=' + lng;
	$.getJSON(customURL, function (data) {
		logData(data);
	});
}

// Takes city, geocodes it, gets the lat & lng coords, sets a marker on that location in the map, and runs the search SeatGeek function on those coords.
function codeAddress(city) {
  var address = city;
  geocoder.geocode( { 'address': address}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      var newLat = results[0].geometry.location.k;
      var newLng = results[0].geometry.location.D;
      // Run SeatGeek api based on geocoded lat&lng coords
      searchSeatGeek(newLat,newLng);

      // Centers and sets a marker in the map on the geocoded address inputed by the user
      map.setCenter(results[0].geometry.location);
      var marker = new google.maps.Marker({
          map: map,
          position: results[0].geometry.location
      });
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}

google.maps.event.addDomListener(window, 'load', initialize);