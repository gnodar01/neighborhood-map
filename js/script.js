var runGet = function() {
	console.log("hello");
}

function MyViewModel() {
	this.cityVal = ko.observable('');
	this.customURL = ko.computed(function() {
		return 'http://api.seatgeek.com/2/events?geoip=true&per_page=25&venue.city=' + this.cityVal();
	}, this);
	this.getData = function() {
		$.getJSON(this.customURL(), function (data) {
			console.log(data);
		});
	}
}

ko.applyBindings(new MyViewModel());
