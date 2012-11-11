var http = require('http');
var url = require('url');
var path = require('path');
var fs = require('fs');
var events = require('events');
var util = require('util');

var geo = require('./lib/geolib');
var geodb = require('./lib/geodb');

var PORTNUM = 8000;

function serverLog(message){
  var time = new Date();
  console.log('['+ time.getHours() + ':' +
              time.getMinutes() + ':' + 
              time.getSeconds() + '] ' +
              message);
}

function filetype(filename){
  var ftype = path.extname(filename);
  switch(ftype){
  case '.html': return {'Content-Type':'text/html'};
  case '.js':   return {'Content-Type':'text/script'};
  case '.css':  return {'Content-Type':'text/css'};    
  default:      return {'Content-Type':'text/plain'};  
  }
}

//assumes path exists!
function serveFile(filepath, res, callback){
  if(filepath[filepath.length-1] ==  '/')
    filepath += 'index.html';

  serverLog("fpath "+ filepath);

  fs.readFile(filepath, 'binary', function(err, file){
    res.writeHead(200, filetype(filepath));
    res.write(file, 'binary');
    res.end('\n');
    if(callback) callback();
  });
}

//non-file endpoints to server
function GeoServer(){};
util.inherits(GeoServer, events.EventEmitter);
var geoserve = new GeoServer();

geoserve.on('/api/posts', function(res, args){
  if(args.geohash){
    geodb.getPostsByHash(res, args.geohash);
    serverLog(args.geohash+'# fetch');
  } else if(args.user) {
    geodb.getPostsByUser(res, args.user);
    serverLog(args.user+' fetch');
  } else 
    res.end();
});

geoserve.on('/api/geohash', function(res, args){
  res.writeHead(200, {'Content-Type':'text/plain'});
  res.write(geo.hash(args.lat, args.lon));
  res.end('\n');
});

geoserve.on('/api/geofind', function(res, args){
  res.writeHead(200, {'Content-Type':'text/plain'});
  var loc = geo.find(args.hash);
  res.write(loc.lat + ' ' + loc.lng);
  res.end('\n');
});

geoserve.on('/api/create', function(res, args){
  //if args, create account
  //if no args, show form for account creation
  if(args.user && args.pass){
    serverLog('Attempting to create account for '+args.user);
    geodb.createUser(args.user, args.pass, res);
  } else {
    serveFile('./files/newuser.html', res);
  }
});

geoserve.on('/api/new', function(res, args){
  //create new post, redirect back to location of post
  serverLog(args.hash+'#'+args.user+' posts `'+args.content+'`');
  geodb.createPost(args.user, args.pass, args.content, args.hash, res);
});

geoserve.on('geohash', function(res, args){
  serveFile('./files/index.html', res);
});

//end endpoint listeners section, 
//invoke endpoints with geoserve.emit('name', res, args);

//'main'
var s = http.createServer(function (req, res) {
  var parsedReq = url.parse(req.url, true);
  var endpoint = parsedReq.pathname;
  var filepath = path.join(process.cwd(), 'files', endpoint);
  var args = parsedReq.query;

  //serverLog('Request for ' + endpoint );
  
  fs.exists(filepath, function(exists){
    if(exists){
      //serve requested files if path exists
      serveFile(filepath, res);
      return;
    }
    
    if( geoserve.listeners(endpoint).length > 0 ){
      geoserve.emit(endpoint, res, args);      
    } else if ( endpoint.substring(0, 3) == '/u/' ){
      serveFile('./files/userfeed.html', res); 
    } else if ( geo.validHash( endpoint.slice(1) ) ){
      geoserve.emit('geohash', res, args);
    } else {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.write("Invalid Query.");
      res.end('\n');
    }
  });
});

s.listen(PORTNUM);
serverLog('Serving on port ' + PORTNUM);