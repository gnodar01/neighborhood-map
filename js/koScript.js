function MyViewModel() {
	var self = this;

	this.cityVal = ko.observable();
	/* When the button is clicked, the city that was
	inputted is sent to the google maps geocoder to get the
	lat & long coordinates, this makes searching the SeatGeek
	more accurate than simply searching by city*/
	this.runSearch = function() {
		codeAddress(this.cityVal());
	}
	this.performers = ko.observableArray();
}

var vm = new MyViewModel();

ko.applyBindings(vm);