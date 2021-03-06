function MyViewModel() {
  var self = this;

  self.searchButtonText = ko.observable("Show Me The Music!");

  self.cityVal = ko.observable("Orlando");
  self.venueVal = ko.observable();

  self.events = ko.observableArray();
  self.markers = ko.observableArray();

  self.resultsInfo = ko.observable(false);
  self.resultsList = ko.observable(false);
  self.performerInfo = ko.observable(false);
  self.currentEventName = ko.observable();
  self.currentEventDate = ko.observable();
  self.currentVenueName = ko.observable();
  self.currentEventIndex = ko.observable();
  self.currentPerformerID = ko.observable();
  self.currentVenueAddress = ko.observable();
  self.currentPerformerName = ko.observable();
  self.currentPerformerURLs = ko.observableArray();
  self.currentPerformerGenres = ko.observableArray();
  self.currentPerformerImages = ko.observableArray();

  /* When the button is clicked, the city that was
  inputted is sent to the google maps geocoder to get the
  lat & long coordinates, which makes searching the SeatGeek
  more accurate than simply searching by city. */
  self.runSearch = function() {
    var city = self.cityVal();
    // Change button text after initial search, so user knows more events may be loaded.
    self.searchButtonText("Load More Events");
    // Keeps track of what page of results we are currently on.
    sgCurrentPage++;
    codeAddress(city);
  };

  // Cleans out data from previous city search, and runs search on new city.
  self.cleanSearch = function() {
    var newCity;
    if (self.cityVal()) {
      newCity = self.cityVal();
      sgCurrentPage = 1;
      allEvents = [];
      allMarkers = [];
      setAllMap(null);
      self.currentEventIndex(null);
      codeAddress(newCity);
    } else {
      alert("Enter a City");
    }
  };

  self.displayResults = function() {
    if (self.resultsList()) {
      self.resultsList(false);
    } else {
      self.resultsList(true);
    } 
  };

  self.displayEvent = function() {
    var eventItem = this;

    var index = eventItem.eventIndex;
    // Set perfomer's location in eventPerformer array within event object.
    var performerIndex = eventItem.performerIndex;
    // Get performer's unique ID
    var performerID = eventItem.performerID;
    var performerName = eventItem.performerName;

    var marker = allMarkers[index];
    var currentEvent = allEvents[index];
    var currentPerformer = currentEvent.eventPerformers[performerIndex];

    /* Result list items have a css data-bind that checks if its index equals the index currently
     in the currentEventIndex observable. If it is, all list items with the same index (all event performers) 
     have the highlighted-event class attached. */
    self.currentEventIndex(index);
    /* Similar to above, each performer has a unique SeatGeek ID attached to it, which is passed to an observable
     when the list item is clicked. The css data-bind attaches a highlight-item class to list items with this ID. */
    self.currentPerformerID(performerID);

    // If an info window is open, close it and set it to current event's info window.
    if (currentInfoWindow) {
      currentInfoWindow.close();
      currentInfoWindow = marker.eventInfo;
    } else {
      currentInfoWindow = marker.eventInfo;
    }
    // Open current event's info window.
    marker.eventInfo.open(map,marker);
    map.setCenter(marker.position);

    self.currentEventDate(currentEvent.eventDate);
    // Set observables with event info so that the performer info area in the View will be populated.
    self.currentEventName(currentEvent.eventTitle);

    self.currentVenueName(currentEvent.eventVenue.name);
    self.currentVenueAddress(currentEvent.eventVenue.address);

    self.currentPerformerName(currentPerformer.performerName);

    // Search and get data from EchoNest API on this artist
    searchSpotify(performerName);
  };

  // Displays clicked venue name in marker's info window on map
  self.displayVenue = function() {
    var venue = this;
    var venueIndex = venue.eventIndex;
    var venueMarker = allMarkers[venueIndex];

    showVenueWindow(venueMarker);
  };

  self.filterVenues = function() {
    var venueFilter;
    // In case there is another filter, it should be removed before re-filtering.
    self.clearFilter();
    // Close current info window, if there is one set.
    if (currentInfoWindow) {
      currentInfoWindow.close();
    }

    // Get the value inputted in the filter search, and set to all lower case letters.
    if (self.venueVal()) {
      venueFilter = self.venueVal().toLowerCase();
    } else {
      return null;
    }

    var events = allEvents, markers = allMarkers;

    // Empty out all events currently in events observable.
    self.events([]);
    // Removes each marker currently in markers observable.
    setAllMap(null);
    self.markers([]);

    // Go through all events, and add any that fit the filter search value to observables.
    var currentVenue, currentVenueName;
    for (var i = 0, eventsLength = events.length; i < eventsLength; i++) {
      currentVenue = events[i];
      // Set venue names to lower case, to campare to filter search value (also set to lowercase).
      currentVenueName = currentVenue.eventVenue.name.toLowerCase();
      // If the filter serach value matches any of the venue names, push the event and it's map marker to observables.
      if (venueFilter === currentVenueName) {
        self.events.push(currentVenue);
        self.markers.push(markers[i]);
      }
    }
    // Set all markers in observable to the map.
    setAllMap(map);
  };

  // Removes any value set in view.
  self.removeFilter = function() {
    self.venueVal(null);
    self.clearFilter();
  };

  // Clears out any remnants from the filter.
  self.clearFilter = function() {
    self.events(allEvents);
    self.markers(allMarkers);
    // Remove all markers before re-populating to avoid doubling up on markers.
    setAllMap(null);
    setAllMap(map);
  };

  self.openPerformerInfo = function() {
    // When performerInfo is true, the css changes to performer info view.
    self.performerInfo(true);
  };

  self.closePerformerInfo = function() {
    // When performerInfo is false, the css changes to map view
    self.performerInfo(false);
    // Re-initializes the map
    initialize();
    // Re-Sets marker on current city
    setCityMarker();
    // Re-sets all event markers to map
    setAllMap(map);
  };

  /*-------------------PRIVATE-------------------*/

  var geocoder, map;
  // When and info window is opened, currentInfoWindow will be set to it.
  var currentInfoWindow;
  // Current city coordinates
  var cityLat = 28.4158, cityLng = -81.2989;
  // Holds marker of current city
  var cityMarker;
  // Holds all events, and event markers
  var allEvents = [], allMarkers = [];
  // Keeps track of which page on seet geek results we're currently on
  var sgCurrentPage = 0;

  $(function () {
    //setup ajax error handling
    $.ajaxSetup({
      error: function (xhr, status, error) {
        console.log(xhr);
        alert( "Something went wrong, and it's entirely your fault" +
              "\n" + "Status: " + xhr.status + " - " + status + " " + error );
      }
    });
  });

  // Initializes Google Map
  var initialize = function () {
    geocoder = new google.maps.Geocoder();
    var latlng = new google.maps.LatLng(cityLat, cityLng);
    var mapOptions = {
      zoom: 10,
      center: latlng,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.DEFAULT,
        mapTypeIds: [
          google.maps.MapTypeId.ROADMAP,  
          google.maps.MapTypeId.TERRAIN
        ]
      },
      zoomControl: true,
      zoomControlOptions: {
        style: google.maps.ZoomControlStyle.SMALL
      },
      panControl: false
    };
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    // Keeps track of map resizes, and sets new center based on new map size
    function newCenter() {
      var center = map.getCenter();
      google.maps.event.trigger(map, "resize");
      map.setCenter(center); 

    }
    google.maps.event.addDomListener(map, "idle", function() {
      newCenter();
    });
    google.maps.event.addDomListener(window, "resize", function() {
      newCenter();
    });
  };

  /* Takes city, geocodes it, gets the lat & lng coords, sets a marker on that location in the map,
   and runs the search SeatGeek function on those coords. */
  var codeAddress = function (city) {
    self.cityVal(null);
    geocoder.geocode( {'address': city}, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
          var resultsLocation = results[0].geometry.location;
          cityLat = resultsLocation.lat();
          cityLng = resultsLocation.lng();

        /* Centers and sets a marker in the map on the geocoded address inputed by the user.
         results[0] is set because the geocoded address may contain more than one possible 
         result. The first result has the highest probability of being correct, and there
         is usually no need to use the others. */
        map.setCenter(resultsLocation);
        setCityMarker();
        } else {
        alert("Geocode was not successful for the following reason: " + status);
      }

      // Run the Seat Geek API and get data of artists/music events in current city
      searchSeatGeek(cityLat,cityLng);
    });
  };

  // Sets marker on current city.
  var setCityMarker = function() {
    var latLng = new google.maps.LatLng(cityLat, cityLng);

    // Remove marker placed on current city, if it exists
    if (cityMarker) {
      cityMarker.setMap(null);
    }

    // Set marker on new city
    cityMarker = new google.maps.Marker({
      map: map,
      position: latLng,
      icon: "images/blue-dot.png"
    });
  };

  // Runs the SeatGeek api, and returns a list of 25 events near the city the user inputted (after geocoding).
  var searchSeatGeek = function(lat,lng) {
    /* SeatGeeks api has a list of taxonomies you can search through. These are event types like races, dance events, plays, concerts, etc.
    Only music related events are needed so it must be specified in the api call. The taxonomies array includes all music related taxonomies
    that are returned by SeatGeek. Each taxonomy is looped through, with an added search query, and appended to the full query, which is then
    appended to the full URL for the api call. */
    var taxonomies = ['concert','music_festival','classical','classical_opera','classical_vocal','classical_orchestral_instrumental'];

    function getResults (results) {
      parseSGResults(results);
    }

    var sgData = {
      per_page: 50,
      'taxonomies.name': taxonomies,
      lat: lat,
      lon: lng,
      page: sgCurrentPage,
      client_id: 'NzE1ODMzN3wxNDkwNDk1Mzk2LjUx',
    };

    $.ajax({
      url: "https://api.seatgeek.com/2/events",
      dataType: 'json',
      data: sgData,
      traditional: true,
      success: getResults,
    });
  };

  /* Parse the data response from the API call, and form an array of event objects
    with relevant data, which will be displayed on the google map. */
  var parseSGResults = function(data) {
    var parseDate = function(dateToParse) {
      // Split inputted date into two arrays; 0: Date, 1: Time
      var dateTime = dateToParse.split('T');
      // Split date into three arrays; 0: yyyy, 1: mm, 2: dd
      var date = dateTime[0].split('-');
      // Split time into three arrays; 0: hh, 1: mm, 2: ss
      var time = dateTime[1].split(':');

      // Translate the hour string into integer (so that it rids 0s in front of single digit times e.g. 3:00 vs 03:00).
      time[0] = parseInt(time[0]);
      // Translate from 24 hour time to 12 hour time.
      if (time[0] >= 13) {
        time[0] -= 12;
        time[3] = "p.m.";
      } else {
        time[3] = "a.m.";
      }

      var dateString = date[1] + "/" + date[2] + "/" + date[0];
      var timeString = time[0] + ":" + time[1] + " " + time[3];
      var parsedDateString = dateString + " - " + timeString;

      return parsedDateString;
    };

    for (var i = 0, numEvents = data.events.length; i < numEvents; i++) {
      var currentEvent = data.events[i], currentVenue = currentEvent.venue;

      // IIFE which takes in the ugly standardized date format returned by SeatGeek, and makes it easily readable.
      // SeatGeeks returned date format is: yyyy-mm-ddThh:mm:ss
      var currentDate = parseDate(currentEvent.datetime_local);

      var eventListing = {
        eventTitle: currentEvent.title,
        eventType: currentEvent.type,
        eventURL: currentEvent.url,
        eventIndex: i
      };

      /* If the event date is flagged true by SeatGeek, then the show date is an estimate;
        if the event time is flagged true by SeatGeek, then the show date is correct, but the time
        is set to 3:30 a.m. */
      if (currentEvent.date_tbd) {
        eventListing.eventDate = currentDate + " (Date estimated)";
      } else if (currentEvent.time_tbd) {
        eventListing.eventDate = currentDate + " (Exact time not set)";
      } else {
        eventListing.eventDate = currentDate;
      }
      
      eventListing.eventPerformers = [];
      var performer;
      for (var j = 0, perfLength = currentEvent.performers.length; j < perfLength; j++) {
        performer = {};
        performer.performerName = currentEvent.performers[j].name;
        performer.performerImgURL = currentEvent.performers[j].image;
        // Set the index of the event the performer belongs to, so that performer always has reference to the event.
        // If another page has been loaded, the event index has to start where the previous event index ended.
        performer.eventIndex = i + (50 * sgCurrentPage - 50);
        // Set the index of the performer within the event, so that performer has reference to it's location within the event.
        performer.performerIndex = j;
        // Each performer on SeatGeek's database has a unique ID, which among other things, can be used with the Echo Nest API.
        performer.performerID = currentEvent.performers[j].id;
        // Push each performer for an event to the event listing.
        eventListing.eventPerformers.push(performer);
      }

      eventListing.eventVenue = {
        name: currentVenue.name,
        address: currentVenue.address + ", " + currentVenue.display_location + ", " + currentVenue.postal_code,
        lat: currentVenue.location.lat,
        lng: currentVenue.location.lon,
      };
      // Push to all events array which holds each event listing returned from SeatGeek.
      allEvents.push(eventListing);
    }
    self.events(allEvents);
    // Sets the results info observable to true so that the view knows to show results.
    self.resultsInfo(true);
    // Place marker on each event's location with performer information.
    mapSGResults(allEvents);
  };

  // Make marker and corresponding info window for each event location.
  var mapSGResults = function(eventData) {
    var eventMarker, eventLat, eventLng, eventLatLng;

    // Event listner on marker. When clicked, venue information will be loaded.
    var addClickListener = function(marker) {
      google.maps.event.addListener(marker, 'click', function() {
        var currentMarker = this;
        showVenueWindow(currentMarker);
      });
    };

    // All events are passed in, so if on second page of results, it need to start where new page's events begin
    for (var i = 0 + (50 * sgCurrentPage - 50), eventDataLen = eventData.length; i < eventDataLen; i++) {
      // Seat Geek data includes lat/lng coordinates with event
      eventLat = eventData[i].eventVenue.lat;
      eventLng = eventData[i].eventVenue.lng;
      // Construct a lat/long object using google maps LatLng class.
      eventLatLng = new google.maps.LatLng(eventLat, eventLng);

      // Place event marker on map with custom icon to differentiate it.
      // Todo: create custom icon for each genre.
      eventMarker = new google.maps.Marker({
        map: map,
        position: eventLatLng,
        icon: "images/green-dot.png"
      });

      // New info window for each event. Will load with event title.
      eventMarker.eventInfo = new google.maps.InfoWindow({
        // HTML that provides markup for event information displayed in the google maps info window.
        // The button will access the view model's openPerformerInfo function
        content: "<div id='content'>" +
        "<h1 id='content_header'>" + eventData[i].eventTitle + "</h1>" +
        "<button onclick=vm.openPerformerInfo()>Get Info</button>"
      });

      // New info window for each venue. Will load with venue name.
      eventMarker.venueInfo = new google.maps.InfoWindow({
        content: "<div id='content'>" +
        "<h1 id='content_header'>" + eventData[i].eventVenue.name + "</h1>"
      });

      addClickListener(eventMarker);

      // Push to array of all markers.
      allMarkers.push(eventMarker);
    }
    // Set to observable array for filtering.
    self.markers(allMarkers);
  };

  // Displays venue name in info window.
  var showVenueWindow = function(marker) {
    // If an info window is open, close it and set it to current event's info window.
    if (currentInfoWindow) {
      currentInfoWindow.close();
      currentInfoWindow = marker.venueInfo;
    } else {
      currentInfoWindow = marker.venueInfo;
    }
    marker.venueInfo.open(map,marker);
    map.setCenter(marker.position);
  };

  // Sets all markers in view to map
  var setAllMap = function(map) {
    for (var i = 0; i < self.markers().length; i++) {
      self.markers()[i].setMap(map);
    }
  };

  var searchSpotify = function(performerName) {
    console.log('searching Spotify')
    $.get("https://api.spotify.com/v1/search", {
      q: performerName,
      type: 'artist',
    }, function(data) {
      querySpotify(data.artists.items[0].id);
    }, 'json')
  };

  var querySpotify = function(artistId) {
    // urls, video, genre
    $.get("https://api.spotify.com/v1/artists/" + artistId, {}, function(data) {
      // console.log(data);
      parseENResults(data);
    }, 'json')
  }

  var parseENResults = function (artistData) {
    // Empty observables in case there is any information that cannot be overwritten by the new artist's info.
    self.currentPerformerURLs([]);
    self.currentPerformerGenres([]);
    self.currentPerformerImages([]);

    var artistURLs = [artistData.external_urls],
      artistGenres = artistData.genres,   
      artistImages = [artistData.images[0]];
    /* artistGenres and artistVideos are already arrays, so the obsrvable arrays may simply be set to them;
     artistGenres is not an array, it is an object, so it must be pushed to the observable array. */
    self.currentPerformerURLs(artistURLs);
    self.currentPerformerGenres(artistGenres);
    self.currentPerformerImages(artistImages);
  };

  google.maps.event.addDomListener(window, 'load', initialize);
}

var vm = new MyViewModel();
ko.applyBindings(vm);