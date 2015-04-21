function MyViewModel() {
	var self = this;

	self.cityVal = ko.observable();
	/* When the button is clicked, the city that was
	inputted is sent to the google maps geocoder to get the
	lat & long coordinates, which makes searching the SeatGeek
	more accurate than simply searching by city*/
	self.runSearch = function() {
		codeAddress(self.cityVal());
	}

	self.eventInfo = ko.observableArray();
	self.performers = ko.observableArray();
	self.markers = ko.observableArray();

	self.currentEventName = ko.observable();
	self.currentEventDate = ko.observable();
	self.currentVenueName = ko.observable();
	self.currentVenueAddress = ko.observable();
	self.currentPerformers = ko.observableArray();
	self.currentEventIndex = ko.observableArray();

	self.displayEvent = function() {
		/* If a performer from the results list is clicked, index is set to the performerIndex property of that list item.
		 If a marker is clicked, index is set to the marker's eventIndex property.
		 Both refer to their respective event's index value, but the 'this' value differs depending on how displayEvent()
		is triggered. */
		var index = this.performerIndex || this.eventIndex;

		var marker = self.markers()[index];
		var currentEvent = self.eventInfo()[index];

		/* Result list items have a css data-bind that checks if its index equals the index currently
		 in the currentEventIndex observable. If it is, all list items with the same index have the
		 highlighted-item class attached */
		self.currentEventIndex(index);

		// If an info window is open, close it and set it to current event's info window.
		if (currentInfoWindow) {
			currentInfoWindow.close();
			currentInfoWindow = marker.info;
		}
		else {
			currentInfoWindow = marker.info;
		}
		// Open current event's info window
		marker.info.open(map,marker)

		// Set observables with event info so that the performer info area in the View will be populated
		self.currentEventName(currentEvent.eventTitle);
		self.currentEventDate(currentEvent.eventDate);

		self.currentVenueName(currentEvent.eventVenue.name);
		self.currentVenueAddress(currentEvent.eventVenue.address);

		// Empty currentPerformers Array
		self.currentPerformers([]);
		for (var i = 0, perfLength = currentEvent.eventPerformers.length;  i < perfLength; i++) {
			self.currentPerformers.push(currentEvent.eventPerformers[i]);
		}
	}


	/*-------------------PRIVATE-------------------*/

	var geocoder, map;
	var initialize = function () {
	  geocoder = new google.maps.Geocoder();
	  var latlng = new google.maps.LatLng(28.4158, -81.2989);
	  var mapOptions = {
	  	zoom: 8,
	    center: latlng
	  }
	  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
	}

	/* When and info window is opened, currentInfoWindow will be set to it.
	It needs to be outside of the mapSGResults function so that the View may access it.*/
	var currentInfoWindow;
	// Make marker and corresponding info window for each event location.
	var mapSGResults = function(eventData) {
		var eventMarker, contentString, eventLat, eventLng, eventLatLng;

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
				'<h1 id="content_header">' + eventData[i].eventTitle + '</h1>'
			});
			/* Create and set an eventIndex property on each marker, so that each marker always carries a reference
				to the event it refers to */
			eventMarker.eventIndex = i;

			// Push to observable array, so that the when a list item in the view is clicked, the corresponding info window will open.
			self.markers.push(eventMarker);

			// Event listner on each marker, which opens the corresponding info window, and displays event info in the View.
			google.maps.event.addListener(eventMarker, 'click', function() {
				// If there is already a marker that has had its info window opened, close the info window.
				if (currentInfoWindow) {
					currentInfoWindow.close();
				}
				/* Set currentInfoWindow to the info window of the marker that has been clicked on,
				so that it can be closed when the next marker's info window is opened.*/
				currentInfoWindow = this.info;
				// Open the info window on the marker that has been clicked on.
				this.info.open(map,this);

				/* displayEvent is a 'data-bind'ed function in the HTML. We call it on 'this' (the clicked marker)
				 to simulate the effect of clicking a list item in the View's result list. The displayEvent function
				 has a way to account for the different structures of a marker object and a result list object. */
				self.displayEvent.call(this);
			});
		}
	}

	/* Parse the data response from the API call, and form an array of event objects
		with relevant data, which will be displayed on the google map.*/
	var parseSGResults = function(data) {
		var numEvents = data.events.length;

		for (var i = 0; i < numEvents; i++) {
			var currentEvent = data.events[i], currentVenue = currentEvent.venue;

			// IIFE which takes in the ugly standardized date format returned by SeatGeek, and makes it easily readable
			// SeatGeeks returned date format is: yyyy-mm-ddThh:mm:ss
			var currentDate = (function(dateToParse) {
				// Split inputted date into two arrays; 0: Date, 1: Time
				var dateTime = dateToParse.split('T');
				// Split date into three arrays; 0: yyyy, 1: mm, 2: dd
				var date = dateTime[0].split('-');
				// Split time into three arrays; 0: hh, 1: mm, 2: ss
				var time = dateTime[1].split(':');

				// Translate the hour string into integer (so that it rids 0s in front of single digit times e.g. 3:00 vs 03:00)
				time[0] = parseInt(time[0]);
				// Translate from 24 hour time to 12 hour time
				if (time[0] >= 13) {
					time[0] -= 12;
					time[3] = "p.m.";
				}
				else {
					time[3] = "a.m.";
				}

				var dateString = date[1] + "/" + date[2] + "/" + date[0];
				var timeString = time[0] + ":" + time[1] + " " + time[3];
				var parsedDateString = dateString + " - " + timeString;

				return parsedDateString;
			}(currentEvent.datetime_local));

			var eventListing = {};

			eventListing.eventTitle = currentEvent.title;
			eventListing.eventType = currentEvent.type;
			eventListing.eventURL = currentEvent.url;

			/* If the event date is flagged true by SeatGeek, then the show date is an estimate;
				if the event time is flagged true by SeatGeek, then the show date is correct, but the time
				is set to 3:30 a.m. */
			if (currentEvent.date_tbd) {
				eventListing.eventDate = currentDate + " (Date estimated)";
			}
			else if (currentEvent.time_tbd) {
				eventListing.eventDate = currentDate + " (Exact time not set)";
			}
			else {
				eventListing.eventDate = currentDate;
			}
			
			eventListing.eventPerformers = [];
			for (var j = 0; j < currentEvent.performers.length; j++) {
				var performer = {};
				performer.performerName = currentEvent.performers[j].name;
				performer.performerImgURL = currentEvent.performers[j].image;
				// Each performer on SeatGeek's database has a unique ID, which among other things, can be used with the Echo Nest API
				performer.performerID = currentEvent.performers[j].id;
				performer.performerIndex = i;
				// Push each performer for an event to the even listing.
				eventListing.eventPerformers.push(performer);
				// Push each performer to observable array, so they appear as a list in view.
				self.performers.push(performer);
			}

			eventListing.eventVenue = {
				name: currentVenue.name,
				address: currentVenue.address + ", " + currentVenue.display_location + ", " + currentVenue.postal_code,
				lat: currentVenue.location.lat,
				lng: currentVenue.location.lon
			}

			// Push to observable array so that event info can be displayed when a list item in the view is clicked.
			self.eventInfo.push(eventListing);
		}
		// Place marker on each event's location with performer information.
		mapSGResults(self.eventInfo());
		console.log(self.eventInfo())
	}

	// Runs the SeatGeek api, and returns a list of 25 events near the city the user inputted (after geocoding).
	var searchSeatGeek = function(lat,lng) {
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

		var customURL = 'http://api.seatgeek.com/2/events?per_page=50' + fullTaxonomyQuery + '&lat=' + lat + '&lon=' + lng;

		$.getJSON(customURL, function (data) {
			parseSGResults(data);
		});
	}

	/* Takes city, geocodes it, gets the lat & lng coords, sets a marker on that location in the map,
	 and runs the search SeatGeek function on those coords. */
	var codeAddress = function (city) {
	  geocoder.geocode( {'address': city}, function(results, status) {
	    if (status == google.maps.GeocoderStatus.OK) {
	      resultsLocation = results[0].geometry.location
	      
	      cityLat = resultsLocation.lat();
	      cityLng = resultsLocation.lng();

	      /* Centers and sets a marker in the map on the geocoded address inputed by the user.
	      results[0] is set because the geocoded address may contain more than one possible 
	      result. The first result has the highest probability of being correct, and there
	      is usually no need to use the others.*/
	      map.setCenter(resultsLocation);
	      var marker = new google.maps.Marker({
	        map: map,
	        position: resultsLocation,
	        icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
	      });
	    } 
	    else {
	      alert('Geocode was not successful for the following reason: ' + status);
	    }

	    searchSeatGeek(cityLat,cityLng);
	  });
	}

	google.maps.event.addDomListener(window, 'load', initialize);
}

var vm = new MyViewModel();

ko.applyBindings(vm);
