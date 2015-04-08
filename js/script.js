/* Parse the data response from the API call, and form an array of event objects
	with relevant data, which will be displayed on the google map.*/
var logData = function(data) {
	var numEvents = data.events.length;
	var eventList = [];
	for (var i = 0; i < numEvents; i++) {
		var currentEvent = data.events[i], currentVenue = currentEvent.venue;
		var eventListing = {};

		eventListing.eventTitle = currentEvent.title;
		eventListing.eventType = currentEvent.type;
		eventListing.eventURL = currentEvent.url;

		/* If the event date is flagged true by SeatGeek, then the show date is an estimate;
			if the event time is flagged true by SeatGeek, then the show date is correct, but the time
			is set to 3:30 a.m. */
		if (currentEvent.date_tbd) {
			eventListing.eventDateEstimate = currentEvent.datetime_local;
		}
		else if (currentEvent.time_tbd) {
			eventListing.eventTimeEstimate = currentEvent.datetime_local;
		}
		else {
			eventListing.eventDate = currentEvent.datetime_local;
		}
		
		eventListing.eventPerformers = [];
		for (var j = 0; j < currentEvent.performers.length; j++) {
			var performer = {};
			performer.performerName = currentEvent.performers[j].name;
			performer.PerformerImgURL = currentEvent.performers[j].image;
			// Each performer on SeatGeek's database has a unique ID, which among other things, can be used with the Echo Nest API
			performer.performerID = currentEvent.performers[j].id;
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