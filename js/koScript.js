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
	this.eventInfo = ko.observableArray();
	this.performers = ko.observableArray();
	this.markers = ko.observableArray();
	this.openWindow;
	this.displayEvent = function() {
		var index = this.performerIndex;
		var marker = self.markers()[index];
		console.log(index);
		console.log(self.eventInfo()[index]);

		if (self.openWindow) {
			self.openWindow.info.close();
		}
		self.openWindow = marker;
		marker.info.open(map,marker)
	}
}

var vm = new MyViewModel();

ko.applyBindings(vm);