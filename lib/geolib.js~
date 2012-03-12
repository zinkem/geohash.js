/*
	Contains javascript functions for coding and decoding geohashes

*/
var base32 = ['0','1','2','3','4','5','6','7',
		          '8','9','a','b','c','d','e','f',
		          'g','h','i','j','k','l','m','n',
		          'o','p','q','r','s','t','u','v'];

var base2 = {"0":"00000","1":"00001","2":"00010","3":"00011",
						 "4":"00100","5":"00101","6":"00110","7":"00111",
						 "8":"01000","9":"01001","a":"01010","b":"01011",
						 "c":"01100","d":"01101","e":"01110","f":"01111",
						 "g":"10000","h":"10001","i":"10010","j":"10011",
						 "k":"10100","l":"10101","m":"10110","n":"10111",
						 "o":"11000","p":"11001","q":"11010","r":"11011",
						 "s":"11100","t":"11101","u":"11110","v":"11111"};

function validHash(hash){
		return hash.match('^[0-9a-v]*$');
}

function geohash(lat, lon){
		if(!lon || !lat){
				console.log('Invalid args passed to geohash()');
				return null;
		}

		var hash = '';

		var minlat = -90;
		var maxlat = 90;

		var minlon = -180;
		var maxlon = 180;

		if(lon < minlon || lon > maxlon ||
			 lat < minlat || lat > maxlat){
				console.log('Invalid lat, lon values passed to geohash()');
				return null;
		}

		for(var i = 0; i < 6; i++){
				var hashnum = 0;
				for(var j = 0; j < 5; j++){
						var midlat = (minlat + maxlat)/2;
						var midlon = (minlon + maxlon)/2;
						
						if(lat < midlat){
								maxlat = midlat;
						} else {
								hashnum += 1;
								minlat = midlat;
						}
						hashnum = hashnum << 1;

						if(lon < midlon){
								maxlon = midlon;
						} else {
								hashnum += 1;
								minlon = midlon;
						}
						hashnum = hashnum << 1;
				}
				hashnum = hashnum >> 1;
				hash += base32[hashnum >>> 5];
				hash += base32[hashnum%32];
		}
		return hash;
}

function geofind(hash32){
		if(!validHash(hash32)) return null;

		var hash = '';
		for(var i = 0; i < hash32.length; i++){
				hash += base2[hash32[i]];
		}

		var lat = -90;
		var lon = -180;

		var inclat = 90;
		var inclon = 180;

		var index = 0;
		for(var i = 0; i < 32; i++){
				if(hash[index++] == '1')
						lat += inclat;
				
				if(hash[index++] == '1')
						lon += inclon;

				inclat = inclat/2;
				inclon = inclon/2;
		}

		var resp = {};
		resp.lat = lat;
		resp.lng = lon;
		resp.hash = hash;
		return resp;
}


function GeoHash(lat, lng){
		this.lat = lat;
		this.lng = lng;
		this.hash = geohash(lat, lng);
}

