function initialize() {
	var mapOptions = {
		center: { lat: 39.50, lng: -98.35},
		zoom: 5
	};
	var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
}
google.maps.event.addDomListener(window, 'load', initialize);