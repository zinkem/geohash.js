/**
 * Javascript for Index.html
 * Author: Matthew Zinke
 * requires: navigation.js
 *
 */

var HOST = 'http://www.zinkem.com:8000/';
var mapnav;

function goto(address){
  document.getElementById('query').value = '';
  mapnav.gotoAddress(address, function(results) {
    var lat = results[0].geometry.location.lat();
    var lng = results[0].geometry.location.lng();
    map.setCenter(results[0].geometry.location);

    var thishash = geohash(lat, lng);

    document.getElementById('hash_text').innerHTML = HOST + thishash;
    document.getElementById('address_text').innerHTML = results[0].formatted_address;
    document.getElementById('gps_text').innerHTML = lat + ', ' + lng;
    document.getElementById('hash').value = thishash;
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
    
    //listen for clicks...
    google.maps.event.addListener(marker, 'click', function(event){
      infowin.open(mapnav.map);
    });
    

    var feedentry = '<div class="feedentry">';
    feedentry += '<div class="hash">' + hash + '</div>';
    feedentry += '<div class="faddr">' +results[0].formatted_address+ '</div>';
    feedentry += '<div class="flatlng">(' + 
      results[0].geometry.location.lat() + ', ' + 
      results[0].geometry.location.lng() + ')</div>';
    feedentry += '</div>';

    var feed = document.getElementById('feed');
    feed.innerHTML = feedentry + feed.innerHTML;

  });
}

function initialize() {
  var thishash = location.pathname.slice(1); 
  if(thishash.length == 0)
    thishash = 'khdbbl85q5gj'
  document.getElementById('hash').value = thishash;
   
  mapnav = getNavWithHash('map_canvas', thishash);
  document.getElementById('hash_text').innerHTML = HOST + thishash;
  document.getElementById('address_text').innerHTML = '';
  document.getElementById('gps_text').innerHTML = mapnav.lat + ', ' + mapnav.lng;
 
  var request = new XMLHttpRequest();
  request.open('GET', 'api/posts?geohash=' + thishash, false);
  request.send(null);

  if(request.status == 200){
    var posts = JSON.parse(request.responseText);

    for( i in posts ){
      var node = document.createElement('div');
      node.className = 'post';
      if(i%2 == 0){
        node.className = 'odd_post';
      }
      
      var poster = document.createElement('div');
      poster.className = 'poster';
      poster.innerHTML = posts[i].owner;

      var content = document.createElement('div');
      content.className = 'content';
      content.innerHTML = posts[i].content;

      var phash = document.createElement('span');
      phash.className = 'phash';
      phash.innerHTML = posts[i].geohash;

      var time = document.createElement('span');
      time.className = 'timestamp';
      time.innerHTML = posts[i].time;


      node.appendChild(poster);
      node.appendChild(content);
      node.appendChild(phash);
      node.appendChild(time);
      document.getElementById('feed').appendChild(node);
    }
  }
 
}
