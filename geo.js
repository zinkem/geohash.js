var http = require('http');
var url = require('url');
var path = require('path');
var fs = require('fs');

var geo = require('./lib/geolib');

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
		serverLog(filename + ' is ' + ftype);
		switch(ftype){
		case '.html': return {'Content-Type':'text/html'};
		case '.js':   return {'Content-Type':'text/script'};
		case '.css':  return {'Content-Type':'text/css'};    
		default:  		  return {'Content-Type':'text/plain'};  
		}
}

//'main'
var s = http.createServer(function (req, res) {
		var parsedReq = url.parse(req.url, true);
		var endpoint = parsedReq.pathname;
		var filepath = path.join(process.cwd(), 'files', endpoint);
		var args = parsedReq.query;

		serverLog('Request for ' + endpoint );
		serverLog('Checking path ' + filepath);

		path.exists(filepath, function(exists){
				if(!exists){
						serverLog(endpoint + ' does not exist');
						switch(endpoint){
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
						default:
								var h = endpoint.slice(1);
								if(geo.validHash(h)){
										serverLog(h + ' is a valid hash!');
										fs.readFile('./files/index.html', 'binary', function(err, file){
												res.writeHead(200, {'Content-Type': 'text/html'});
												res.write(file, 'binary');
												res.end('\n');
										});			
								}	else {
										res.writeHead(404, {'Content-Type': 'text/plain'});
										res.write("Invalid Query.");
										res.end('\n');
								}
						}
						return;
				}
				
				if(endpoint == '/')
						fs.readFile('./files/index.html', 'binary', function(err, file){
								res.writeHead(200, {'Content-Type': 'text/html'});
								res.write(file, 'binary');
								res.end('\n');
						});			
				else
						fs.readFile(filepath, 'binary', function(err, file){
								res.writeHead(200, filetype(endpoint));
								res.write(file, 'binary');
								res.end('\n');
						});
		});
});

s.listen(PORTNUM);
serverLog('Serving on port ' + PORTNUM);