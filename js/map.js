function initialize() {
	var mapOptions = {
		center: { lat: 28.4158, lng: -81.2989},
		zoom: 9
	};
	var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
}
google.maps.event.addDomListener(window, 'load', initialize);