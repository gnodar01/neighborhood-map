// Initialize Google map, and geocoder.
var geocoder, map;
function initialize() {
  geocoder = new google.maps.Geocoder();
  var latlng = new google.maps.LatLng(28.4158, -81.2989);
  var mapOptions = {
  	zoom: 8,
    center: latlng
  }
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
}

// Takes city, geocodes it, gets the lat & lng coords, sets a marker on that location in the map, and runs the search SeatGeek function on those coords.
function codeAddress(city) {
  var address = city;
  geocoder.geocode( { 'address': address}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      // Retrieve lat and long coordinates from Geocode results to pass into SeatGeeks api call
      var newLat = results[0].geometry.location.k, newLng = results[0].geometry.location.D;
      // Run SeatGeek api based on geocoded lat&lng coords
      searchSeatGeek(newLat,newLng);

      /* Centers and sets a marker in the map on the geocoded address inputed by the user.
      	results[0] is set because the geocoded address may contain more than one possible 
      	result. The first result has the highest probability of being correct, and there
      	is usually no need to use the others. I could have it display all results and have the
      	user choose the correct one, but that may be overkill, because the vast majority of the
      	time the first result is correct*/
      map.setCenter(results[0].geometry.location);
      var marker = new google.maps.Marker({
          map: map,
          position: results[0].geometry.location,
          icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
      });
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}

google.maps.event.addDomListener(window, 'load', initialize);