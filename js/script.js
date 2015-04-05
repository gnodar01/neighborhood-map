var runGet = function() {
	console.log("hello");
}

function MyViewModel() {
	this.inputVal = ko.observable();
	this.getData = function() {
		$.getJSON('http://api.seatgeek.com/2/events?geoip=true&per_page=25', function (data) {
			console.log(data);
		});
	}
}

ko.applyBindings(new MyViewModel());
