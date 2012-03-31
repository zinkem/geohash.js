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
    //getPosts(thishash);
  }
}

var curPos = { startImage: new google.maps.MarkerImage( '/img/you-are-here-2.png'),
               heldImage: new google.maps.MarkerImage( '/img/you-are-here-1.png'),
               hoverImage: new google.maps.MarkerImage( '/img/you-are-here-3.png') }

//initializes the current position marker
function initCurrentPosition(thishash){
  current_position_marker = mapnav.flagHash(thishash);
  current_position_marker.setOptions({
    draggable: true,
    animation: google.maps.Animation.DROP,
    icon: curPos.startImage
  });
  
  google.maps.event.addListener(current_position_marker, 'mouseover', function(event){
    current_position_marker.setIcon(curPos.hoverImage);
  });
  
  google.maps.event.addListener(current_position_marker, 'mouseout', function(event){
    current_position_marker.setIcon(curPos.startImage);
  });
  
  google.maps.event.addListener(current_position_marker, 'mousedown', function(event){
    current_position_marker.setIcon(curPos.heldImage);
  });
  
  google.maps.event.addListener(current_position_marker, 'mouseup', function(event){
    current_position_marker.setIcon(curPos.startImage);
  });

  google.maps.event.addListener(current_position_marker, 'dragend', function(event){
    var newlocation = current_position_marker.getPosition();
    var thishash = geohash(newlocation.lat(), newlocation.lng());
    updateConsole(newlocation.lat(), newlocation.lng(), '', thishash);    
    //getPosts(thishash);
    current_position_marker.setIcon(curPos.startImage);

  });
}

//initializes the map (and current position marker)
function initMap(thishash){
  if(!validHash(thishash))
    document.getElementById('hash_text').innerHTML = 'error, invalid url';
  
  mapnav = getNavWithHash('map_canvas', thishash);
  initCurrentPosition(thishash);
  updateConsole(mapnav.lat, mapnav.lng, '', thishash);
  
  //adjust marker and re-query posts when bounds change
  google.maps.event.addListener(mapnav.map, 'bounds_changed', function(){
    markerAdjust();
  });

  //suppress bounds changed while dragging
  google.maps.event.addListener(mapnav.map, 'dragstart', function(){
    google.maps.event.clearListeners(mapnav.map, 'bounds_changed');
  });

  //re-enable change of bounds fn
  google.maps.event.addListener(mapnav.map, 'dragend',  function(){
    google.maps.event.addListener(mapnav.map, 'bounds_changed', function(){
      markerAdjust();
    });
  });
  //suppress bounds changed while dragging
  google.maps.event.addListener(mapnav.map, 'dragstart', function(){
    google.maps.event.clearListeners(mapnav.map, 'bounds_changed');
  });

  //re-enable change of bounds fn
  google.maps.event.addListener(mapnav.map, 'dragend',  function(){
    google.maps.event.addListener(mapnav.map, 'bounds_changed', function(){
      markerAdjust();
    });
  });
}

//initializes the page
function initialize() {

  thishash = 'b23lbp7805qi'
  initMap(thishash);

  for(var i = 0; i < 32; i++){
    for(var j = 0; j < 32; j++){
      var marker = mapnav.flagHash('b' + base32[i] + base32[j]);
      var loc = marker.getPosition();
      var opts = {content: base32[i]+base32[j],
                  position: loc };
      var infowin = new google.maps.InfoWindow(opts);

      google.maps.event.addListener(marker, 'click', function(event){
        infowin.open(mapnav.map);
      });
    }
  }

}
