/**
 * Javascript for Index.html
 * Author: Matthew Zinke
 * requires: navigation.js
 *
 */

var mapnav;

function goto(address){
		document.getElementById('query').value = '';
		mapnav.gotoAddress(address, function(results) {
				var lat = results[0].geometry.location.lat();
				var lng = results[0].geometry.location.lng();
				map.setCenter(results[0].geometry.location);
				
				document.getElementById('hash_text').innerHTML = 'geohash.zinkem.com/' + geohash(lat, lng);
				document.getElementById('address_text').innerHTML = results[0].formatted_address;
				document.getElementById('gps_text').innerHTML = lat + ', ' + lng;
		});
}

function flag(address){
		document.getElementById('pinloc').value = '';
		mapnav.flagAddress(address, function(results, marker){
				//do stuff with the marker here, like add annotations

				var hash =  geohash(results[0].geometry.location.lat(),
														results[0].geometry.location.lng());
				var content =  '<h6>' + hash + '<br/>' + 
						results[0].formatted_address + '</h6>';

				var infopts = {content: content,
											 disableAutoPan:false,
											 maxWidth: 0,
											 pixelOffset: new google.maps.Size(0, 0),
											 position: results[0].geometry.location,
											 zIndex: 1}
				var infowin = new google.maps.InfoWindow(infopts);

				google.maps.event.addListener(marker, 'click', function(event){
						infowin.open(mapnav.map);
				});
		});
}

function initialize() {
		
		var thishash = location.pathname.slice(1);
		if(thishash.length == 0)
				thishash = 'khdbbl85q5gj'
		
		mapnav = getNavWithHash('map_canvas', thishash);
		document.getElementById('hash_text').innerHTML = 'geohash.zinkem.com/' + thishash;
		document.getElementById('address_text').innerHTML = '';
		document.getElementById('gps_text').innerHTML = mapnav.lat + ', ' + mapnav.lng;
		
}