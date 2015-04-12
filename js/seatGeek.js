// Runs the SeatGeek api, and returns a list of 25 events near the city the user inputted (after geocoding).
searchSeatGeek = function(lat,lng) {
	/* SeatGeeks api has a list of taxonomies you can search through. These are event types like races, dance events, plays, concerts, etc.
	Only music related events are needed so it must be specified in the api call. The taxonomies array includes all music related taxonomies
	that are returned by SeatGeek. Each taxonomy is looped through, with an added search query, and appended to the full query, which is then
	appended to the full URL for the api call*/
	var taxonomies = ['concert','music_festival','classical','classical_opera','classical_vocal','classical_orchestral_instrumental'],
	taxonomySearchString = '&taxonomies.name=',
	fullTaxonomyQuery = "";
	for (var i = 0, taxLength = taxonomies.length; i < taxLength; i++) {
		var taxonomySearchQuery = taxonomySearchString + taxonomies[i];
		fullTaxonomyQuery += taxonomySearchQuery;
	}
	var customURL = 'http://api.seatgeek.com/2/events?per_page=50' + fullTaxonomyQuery + '&lat=' +lat+ '&lon=' + lng;
	$.getJSON(customURL, function (data) {
		parseSGResults(data);
	});
}

/* Parse the data response from the API call, and form an array of event objects
	with relevant data, which will be displayed on the google map.*/
var parseSGResults = function(data) {
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
			performer.performerImgURL = currentEvent.performers[j].image;
			// Each performer on SeatGeek's database has a unique ID, which among other things, can be used with the Echo Nest API
			performer.performerID = currentEvent.performers[j].id;
			eventListing.eventPerformers.push(performer);
			// Push each performer to the view model's observable array, so they appear in view.
			vm.performers.push(performer);
		}

		eventListing.eventVenue = {
			name: currentVenue.name,
			address: currentVenue.address + ", " + currentVenue.display_location + ", " + currentVenue.postal_code,
			lat: currentVenue.location.lat,
			lng: currentVenue.location.lon
		}
		eventList.push(eventListing);
	}
}
















