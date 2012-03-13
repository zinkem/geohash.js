var http = require('http');
var url = require('url');
var path = require('path');
var fs = require('fs');

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
  fs.readFile(filepath, 'binary', function(err, file){
    res.writeHead(200, filetype(filepath));
    res.write(file, 'binary');
    res.end('\n');
    if(callback) callback();
  });
}

//'main'
var s = http.createServer(function (req, res) {
  var parsedReq = url.parse(req.url, true);
  var endpoint = parsedReq.pathname;
  var filepath = path.join(process.cwd(), 'files', endpoint);
  var args = parsedReq.query;
  
  serverLog('Request for ' + endpoint );

  path.exists(filepath, function(exists){
    if(!exists){
      switch(endpoint){
      case '/api/posts':
        geodb.getPosts(res, args.hash);
        break;
      case '/api/geohash':
        res.writeHead(200, {'Content-Type':'text/plain'});
        res.write(geo.hash(args.lat, args.lon));
        res.end('\n');
        break;
      case '/api/geofind':
        res.writeHead(200, {'Content-Type':'text/plain'});
        var loc = geo.find(args.hash);
        res.write(loc.lat + ' ' + loc.lon);
        res.end('\n');
        break;
      case '/create':
        //if args, create account
        //if no args, show form for account creation
        if(args.user && args.pass){
          geodb.createUser(args.user, args.pass);
          res.writeHead(200, {'Content-Type':'text/plain'});
          res.end('Account Created\n');
        } else {
          res.writeHead(200, {'Content-Type':'text/plain'});
          res.end('No arguments specified\n');
        }
        break;
      case '/login':
        //if args, login
        //if no args, show form to log in
        break;
      case '/user':
        //show user information
        geodb.createPost(args.user, args.pass, args.content, args.hash);
        res.writeHead(200);
        res.end('nice job');
        break;
      default: //if it hasnt ben caught, probably a location hash
        var h = endpoint.slice(1);
        if(geo.validHash(h)){
          serveFile('./files/index.html', res);
        } else {
          res.writeHead(404, {'Content-Type': 'text/plain'});
          res.write("Invalid Query.");
          res.end('\n');
        }
      }
      return;
    }
    
    //fileserve stuff
    if(endpoint == '/')
      serveFile('./files/index.html', res);
    else
      serveFile(filepath, res);
  });
});

s.listen(PORTNUM);
serverLog('Serving on port ' + PORTNUM);