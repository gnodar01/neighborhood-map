var logData = function(data) {
	var numEvents = data.events.length;
	var eventList = [];
	for (var i = 0; i < numEvents; i++) {
		var currentEvent = data.events[i], currentVenue = currentEvent.venue;
		var eventListing = {};
		eventListing.eventTitle = currentEvent.title;
		eventListing.eventDate = currentEvent.datetime_local;
		eventListing.eventType = currentEvent.type;
		eventListing.eventURL = currentEvent.url;
		
		eventListing.eventPerformers = [];
		for (var j = 0; j < currentEvent.performers.length; j++) {
			var performer = {};
			performer.name = currentEvent.performers[j].name;
			performer.imgURL = currentEvent.performers[j].image;
			eventListing.eventPerformers.push(performer);
		}

		eventListing.eventVenue = {
			name: currentVenue.name,
			address: currentVenue.address + ", " + currentVenue.display_location + ", " + currentVenue.postal_code,
			lat: currentVenue.location.lat,
			lon: currentVenue.location.lon
		}

		eventList.push(eventListing);
	}
	console.log(eventList);
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