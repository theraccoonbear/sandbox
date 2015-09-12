var GameMap = function(options) {
	var ctxt = this;
	var def = {
		kph: 150,
		tickTime: 10
	};
	
	ctxt.opts = $.extend(def, options);
	ctxt.opts.kpt = ctxt.opts.kph / 60 / 60 / 10;
	console.log('kph', ctxt.opts.kph, 'kpt', ctxt.opts.kpt);
	
	$('[id]').each(function(i, e) {
		var $e = $(e);
		ctxt['$' + $e.attr('id')] = $e;
	});
	
	google.maps.event.addDomListener(window, 'load', function() { ctxt.init(); });
	
};

GameMap.prototype.init = function() {
	var ctxt = this;
	
	var mapOptions = {
		center: { lat: ctxt.opts.mission.start.lat, lng: ctxt.opts.mission.start.lng},
		mapTypeId: google.maps.MapTypeId.SATELLITE,
		zoom: 15,
		panControl: false,
		zoomControl: false,
		mapTypeControl: false,
		scaleControl: false,
		streetViewControl: false,
		overviewMapControl: false,
		draggable: false,
		scrollwheel: false
	};
	
	ctxt.position = ctxt.opts.mission.start;
	
	ctxt.map = new google.maps.Map(document.getElementById('mapCanvas'), mapOptions);
	
	google.maps.event.addListenerOnce(ctxt.map, 'idle', function(){
		ctxt.fogOfWar();
		
		$(window).resize(function() {
			ctxt.fogOfWar();
		});
	
		ctxt.goTo(ctxt.opts.mission.waypoints[0]);
		
		ctxt.tickInterval = setInterval(function() {
			ctxt.tick();
		}, ctxt.opts.tickTime);
	});
	
};

GameMap.prototype.dimensions = function() {
	var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
	var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
	return { width: w, height: h };
};

GameMap.prototype.fogOfWar = function() {
	var ctxt = this;
	var dim = ctxt.dimensions();
	var w = dim.width;
	var h = dim.height;
	
	ctxt.$FOWLeft.css({ left: 0, width: w / 3, top: 0, bottom: 0 });
	ctxt.$FOWRight.css({ right: 0, width: w / 3, top: 0, bottom: 0 });
	ctxt.$FOWTop.css({ width: w / 3, left: w / 3, top: 0, height: h / 3 });
	ctxt.$FOWBottom.css({ width: w / 3, left: w / 3, bottom: 0, height: h / 3 });
};

GameMap.prototype.goTo = function(opts) {
	var ctxt = this;
	
	var latLng = new google.maps.LatLng(opts.lat, opts.lng);
	ctxt.waypoint = latLng;
};

GameMap.prototype.tick = function() {
	var ctxt = this;
	if (ctxt.paused) {
		return;
	}
	
	var dist = this.distanceTo(this.waypoint.lat(), this.waypoint.lng());
	//var tdLat = this.position.lat - this.waypoint.lat();
	//var tdLng = this.position.lng - this.waypoint.lng();
	//
	//var dLat = tdLat * (dist / ctxt.opts.kpt);
	//var dLng = tdLng * (dist / ctxt.opts.kpt);
	//
	//var bearing = ctxt.bearingTo(this.waypoint.lat(), this.waypoint.lng());
	//
	//console.log(bearing);
	//
	
	//var pos = this.newPosition(ctxt.kpt);
	
	
	ctxt.position = this.newPosition(ctxt.opts.kpt);
	
	ctxt.$debug.html(ctxt.position.lat.toFixed(4) + ', ' + ctxt.position.lng.toFixed(4) + '<br>' + ctxt.bearingTo(ctxt.waypoint.lat(), ctxt.waypoint.lng()).toFixed(3) + "&deg;");
	
	//ctxt.position.lat += 0.0001; //dLat;
	//ctxt.position.lng += 0.0001; //dLng;
	
	var latLng = new google.maps.LatLng(ctxt.position.lat, ctxt.position.lng);
	ctxt.map.panTo(latLng);
};

GameMap.prototype.newPosition = function(distance) {
	var ctxt = this;
	
	var lat1 = this.deg2rad(this.position.lat);
	var lon1 = this.deg2rad(this.position.lng);
	var dist = distance / 6371.01; //Earth's radius in km
	var brng = this.deg2rad(this.bearingTo(this.waypoint.lat(), this.waypoint.lng()));

	var lat2 = Math.asin(Math.sin(lat1) * Math.cos(dist) + Math.cos(lat1) * Math.sin(dist) * Math.cos(brng));
	var lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(dist) *  Math.cos(lat1), Math.cos(dist) - Math.sin(lat1) * Math.sin(lat2));
	lon2 = ((lon2 + 3 * Math.PI) % (2 * Math.PI)) - Math.PI;  

	return {
		lat: this.rad2deg(lat2),
		lng: this.rad2deg(lon2)
	};
};

GameMap.prototype.distanceTo = function(lat, lng) {
	return this.distance(this.position.lat, this.position.lng, lat, lng);
};

GameMap.prototype.distance = function(lat1, lon1, lat2, lon2) {
  var R = 6371.01; // Radius of the earth in km
  var dLat = this.deg2rad(lat2-lat1);
  var dLon = this.deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
};

GameMap.prototype.bearingTo = function(lat, lng) {
	return this.bearing(this.position.lat, this.position.lng, lat, lng);
}

GameMap.prototype.bearing = function (lat1,lng1,lat2,lng2) {
	var dLon = (lng2-lng1);
	var y = Math.sin(dLon) * Math.cos(lat2);
	var x = Math.cos(lat1)*Math.sin(lat2) - Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
	var brng = this.rad2deg(Math.atan2(y, x));
	return 360 - ((brng + 360) % 360);
};

GameMap.prototype.rad2deg = function(rad) {
	return rad * 180 / Math.PI;
}

GameMap.prototype.deg2rad = function(deg) {
  return deg * (Math.PI/180)
};