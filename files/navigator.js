/*
	Navigation object to encapsulate google maps
	navigation and geohash navigation

	Author Matthew Zinke

	Requires google api
	Requires geohash.js

*/

var geocoder;

function Navigator(canvas_name, lat, lng, z){
		//init function, to be called with body onload
		//must provide a canvas!
		geocoder = new google.maps.Geocoder();
		this.lat = lat;
		this.lng = lng;

		var latlng = new google.maps.LatLng(lat, lng);
		if(z == null){
				z = 5;
		}

		var myOptions = {
				zoom: z,
				center: latlng,
				mapTypeId: google.maps.MapTypeId.ROADMAP
		}
		
		this.map = new google.maps.Map(document.getElementById(canvas_name), myOptions);
}


function getNavWithHash(canvas_name, hash32){
		//returns a new Navigator object using a hash32
		var coords = geofind(hash32);
		if(coords == null)
				return null;
		return new Navigator(canvas_name, coords.lat, coords.lng, hash32.length);
}

Navigator.prototype.gotoLatLng = function(lat, lng, zoom){
		var locale = new google.maps.LatLng(lat, lng);
		this.map.setCenter(locale);
		this.lat = lat;
		this.lng = lng;
}

Navigator.prototype.flagLatLng = function(lat, lng, zoom){
		var locale = new google.maps.LatLng(lat, lng);
		var marker = new google.maps.Marker({ map: this.map, position: locale});
}

Navigator.prototype.gotoHash = function(hash){
		var coords = geofind(hash);
		if(coords == null)
				return;
		
		locale = new google.maps.LatLng(coords.lat, coords.lng);
		this.lat = coords.lat;
		this.lng = coords.lng;
		this.map.setCenter(locale);
}

Navigator.prototype.flagHash = function(hash){
		var coords = geofind(hash);
		if(coords == null)
				return;
		
		locale = new google.maps.LatLng(coords.lat, coords.lng);
		var marker = new google.maps.Marker({ map: this.map, position: locale});
}

//callback to handle stuff after the async call
Navigator.prototype.gotoAddress = function(address, callback){
		map = this.map;
		geocoder.geocode( { 'address': address}, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
						map.setCenter(results[0].geometry.location);
						if(callback) callback(results);
				} else {
						alert("Navigator cannot find " + address + ": " + status);
				}
		});
}

//callback takes marker as paramter
Navigator.prototype.flagAddress = function(address, callback){
		map = this.map
		geocoder.geocode( { 'address': address}, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
						var marker = new google.maps.Marker({ map: map,
																									position: results[0].geometry.location});
						if(callback) callback(results, marker);
				} else {
						alert("Navigator cannot find " + address + ": " + status);
				}
		});
}
