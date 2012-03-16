/**
 * Javascript for Index.html
 * Author: Matthew Zinke
 * requires: navigation.js
 *
 */

var HOST = 'http://www.zinkem.com:8000/';
var mapnav;
var current_position_marker;

function parseTimeStamp(timestamp){
  var year = timestamp.substring(0, 4);
  var month = timestamp.substring(5, 7);
  
  var day = timestamp.substring(8, 10);
  var time = timestamp.substring(11, 16);
  
  return time+' '+month+'/'+day+'/'+year;
}

function getPosts(thishash){
  document.body.removeChild(document.getElementById('feed'));
  var newfeed = document.createElement('div');
  newfeed.id = 'feed';
  document.body.appendChild(newfeed);
  
  var request = new XMLHttpRequest();
  request.open('GET', 'api/posts?geohash=' + thishash, false);
  request.send(null);
  
  if(request.status == 200){
    var posts = JSON.parse(request.responseText);
    
    for(var i = 0; i < posts.length; i++ ){
      if(posts.length > 8  && i == 0)
        i = posts.length - 8;
      
      //put comment on the map
      placeComment(posts[i].geohash, posts[i].owner, posts[i].content);

      var node = document.createElement('div');
      node.className = 'post';
      if(i%2 == 0){
        node.className = 'odd_post';
      }
      
      var poster = document.createElement('div');
      poster.className = 'poster';
      poster.innerHTML = '<a href="/u/'+posts[i].owner+'">'+posts[i].owner+'</a>';

      var content = document.createElement('div');
      content.className = 'content';
      content.innerHTML = posts[i].content;

      var phash = document.createElement('span');
      phash.className = 'phash';
      phash.innerHTML = '<a href="/'+posts[i].geohash+'">goto</a>';

      var time = document.createElement('span');
      time.className = 'timestamp';
      time.innerHTML = parseTimeStamp(posts[i].time);


      node.appendChild(poster);
      node.appendChild(content);
      node.appendChild(phash);
      node.appendChild(time);
      newfeed.insertBefore(node, newfeed.firstChild);
    }
  }
}

//updates console output and post form target
function updateConsole(lat, lng, address, hash){
  document.getElementById('hash_text').innerHTML = HOST + hash;
  document.getElementById('address_text').innerHTML = address;
  document.getElementById('gps_text').innerHTML = lat + ', ' + lng;
  document.getElementById('hash').value = hash;
}

//goes to address when it is typed in search bar
function goto(address){
  document.getElementById('query').value = '';
  mapnav.gotoAddress(address, function(results) {
    var lat = results[0].geometry.location.lat();
    var lng = results[0].geometry.location.lng();
    map.setCenter(results[0].geometry.location);

    var thishash = geohash(lat, lng);
    current_position_marker.setOptions({
      position: results[0].geometry.location
    });

    updateConsole(lat, lng, results[0].formatted_addres, thishash);
    getPosts(thishash);
 
  });
}

//places a marker on the map, or TODO: update marker when one already exists
function placeComment(hash, user, content){
  var marker = mapnav.flagHash(hash);
  var coords = geofind(hash);
  var location = new google.maps.LatLng(coords.lat, coords.lng);
  var infopts = {content: user + '> ' + content,
                 disableAutoPan:false,
                 maxWidth: 0,
                 pixelOffset: new google.maps.Size(0, 0),
                 position: location,
                 zIndex: 1}
  var infowin = new google.maps.InfoWindow(infopts);

  marker.setIcon('/img/comment-map-icon-2.png');
  
  //listen for clicks...
  google.maps.event.addListener(marker, 'click', function(event){
    infowin.open(mapnav.map);
  });
}

//adjusts current position marker when map moves
function markerAdjust(){

  var mapbounds = mapnav.map.getBounds();
  var ne = mapbounds.getNorthEast();
  var sw = mapbounds.getSouthWest();
  var markedloc = current_position_marker.getPosition();
  if(markedloc.lat() > ne.lat() || markedloc.lat() < sw.lat() ||
     markedloc.lng() > ne.lng() || markedloc.lng() < sw.lng() ){

    var newlocation = mapnav.map.getCenter();
    
    current_position_marker.setOptions({
      position: newlocation
    });
    
    var thishash = geohash(newlocation.lat(), newlocation.lng());

    updateConsole(newlocation.lat(), newlocation.lng(), '', thishash);    
    getPosts(thishash);
  }
}

//initializes the current position marker
function initCurrentPosition(thishash){
  current_position_marker = mapnav.flagHash(thishash);
  current_position_marker.setOptions({
    draggable: true,
    animation: google.maps.Animation.DROP,
    icon: '/img/you-are-here-2.png'
  });
  
  google.maps.event.addListener(current_position_marker, 'mouseover', function(event){
    current_position_marker.setOptions({ icon: '/img/you-are-here-3.png' });
  });
  
  google.maps.event.addListener(current_position_marker, 'mouseout', function(event){
    current_position_marker.setOptions({ icon: '/img/you-are-here-2.png' });
  });
  
  google.maps.event.addListener(current_position_marker, 'mousedown', function(event){
    current_position_marker.setOptions({ icon: '/img/you-are-here-1.png' });
  });
  
  google.maps.event.addListener(current_position_marker, 'mouseup', function(event){
    current_position_marker.setOptions({ icon: '/img/you-are-here-2.png' });
  });
  
  google.maps.event.addListener(current_position_marker, 'dragend', function(event){
    var newlocation = current_position_marker.getPosition();
    var thishash = geohash(newlocation.lat(), newlocation.lng());
    updateConsole(newlocation.lat(), newlocation.lng(), '', thishash);    
    getPosts(thishash);
    current_position_marker.setOptions({ icon: '/img/you-are-here-2.png' });
  });
  
  google.maps.event.addListener(mapnav.map, 'dragend',  markerAdjust);
  google.maps.event.addListener(mapnav.map, 'zoom_changed', markerAdjust);
}

//initializes the map (and current position marker)
function initMap(thishash){
  
  mapnav = getNavWithHash('map_canvas', thishash);
  initCurrentPosition(thishash);
  updateConsole(mapnav.lat, mapnav.lng, '', thishash);    
  getPosts(thishash);
}

//initializes the page
function initialize() {
  var thishash = location.pathname.slice(1); 
  
  if(thishash.length == 0){
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(function(position){
        var lt = position.coords.latitude;
        var lg = position.coords.longitude;
        thishash = geohash(position.coords.latitude,
                           position.coords.longitude);
        initMap(thishash);

      });
      return;
      
    } else {
      console.log('GeoLocation not supported');
      thishash = 'khdbbl85q5gj'
    }
  }

  initMap(thishash);
}
