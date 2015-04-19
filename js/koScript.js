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
	this.displayEvent = function() {
		listItem = this;
		self.displayInfoWindow(listItem);
		self.displayEvent(listItem);
	}
	this.displayInfoWindow = function(listItem) {
		var index = listItem.performerIndex;
		var marker = self.markers()[index];
		console.log(marker)

		if (currentInfoWindow) {
			currentInfoWindow.close();
			currentInfoWindow = marker.info;
		} else {
			currentInfoWindow = marker.info;
		}
		//self.openInfoWindow = marker;
		marker.info.open(map,marker)
	}
	this.dipslayEventInfo = function(listItem) {
		console.log(listItem)
		var eventName
		var eventLocation
		var eventDate
		var eventPerformers
	}
}

var vm = new MyViewModel();

ko.applyBindings(vm);