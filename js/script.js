var logData = function(data) {
	console.log(data);
}
var message = function() {
	console.log(currentView.cityVal());
}

function MyViewModel() {
	this.cityVal = ko.observable();
	/* When the button is clicked, the city that was
	inputted is sent to the google maps geocoder to get the
	lat & long coordinates, this makes searching the SeatGeek
	more accurate than simply searching by city*/
	this.runSearch = function() {
		codeAddress(this.cityVal());
	}
}

var currentView = new MyViewModel();

ko.applyBindings(currentView);
