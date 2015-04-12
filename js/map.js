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

// Make marker and corresponding info window for each event location.
var mapSGResults = function(eventData) {
  var eventMarker, contentString, eventLat, eventLng, eventLatLng, currentWindow;

  for (var i = 0, eventDataLen = eventData.length; i < eventDataLen; i++) {

    eventLat = eventData[i].eventVenue.lat;
    eventLng = eventData[i].eventVenue.lng;
    // Construct a lat/long object using google maps LatLng class.
    eventLatLng = new google.maps.LatLng(eventLat, eventLng);

    // Place event marker on map with custom icon to differentiate it.
    // Todo: create custom icon for each genre.
    eventMarker = new google.maps.Marker({
      map: map,
      position: eventLatLng,
      icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
    });

    // New info window for each event, with it's correspoinding contentString.
    eventMarker.info = new google.maps.InfoWindow({
      // HTML that provides markup for event information displayed in the google maps info window.
      content: '<div id="content">' +
      '<h1 id="content_header">' + '<a href=' + eventData[i].eventURL + '>' + eventData[i].eventTitle + '</a>' + '</h1>'
    });

    // Event listner on each marker, that opens the corresponding info window.
    google.maps.event.addListener(eventMarker, 'click', function() {
      // If there is already a marker that has had its info window opened, close the info window.
      if (currentWindow) {
        currentWindow.close();
      }
      /* Set currentWindow to the info window on the marker that has been clicked on,
      so that it can be closed when the next marker's info window is opened.*/
      currentWindow = this.info;
      // Open the info window on the marker that has been clicked on.
      this.info.open(map,this);
      });
  }
}

google.maps.event.addDomListener(window, 'load', initialize);