var runGet = function(data) {
	console.log(data);
}

function MyViewModel() {
	this.cityVal = ko.observable('');
	this.customURL = ko.computed(function() {
		return 'http://api.seatgeek.com/2/events?geoip=true&per_page=25&venue.city=' + this.cityVal();
	}, this);
	this.getData = function() {
		codeAddress(this.cityVal());
		$.getJSON(this.customURL(), function (data) {
			runGet(data);
		});
	}
}

ko.applyBindings(new MyViewModel());
