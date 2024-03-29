var mysql = require('mysql');
var DATABASE = 'geodb';
var USER_TABLE = 'users';
var POST_TABLE = 'posts';
var TAG_TABLE = 'tags';
var FRIEND_TABLE = 'friends';

function serverLog(message){
  var time = new Date();
  console.log('['+ time.getHours() + ':' +
              time.getMinutes() + ':' + 
              time.getSeconds() + '] ' +
              message);
}

var client = mysql.createConnection({
  host: '127.0.0.1',
  user:'root',
  password:'password'
});

function errhandler(err){
  if(err)
    throw err;
}

client.query('CREATE DATABASE '+DATABASE+';', function(err){
  if(err){
    if(err.number != mysql.ERROR_DB_CREATE_EXISTS){
      throw err;
    } else {
      serverLog(err);
    }
  } else {
    client.query('USE '+DATABASE);
    //initialize DB
    client.query('CREATE TABLE '+USER_TABLE+
                 '(user VARCHAR(225), '+
                 'pass VARCHAR(225), '+
                 'PRIMARY KEY (user));',
                 errhandler);

    client.query('CREATE TABLE '+POST_TABLE+
                 '(id INT(11) AUTO_INCREMENT, '+
                 'owner VARCHAR(225), '+
                 'content VARCHAR(225), '+
                 'geohash CHAR(12), '+
                 'time TIMESTAMP, '+
                 'privileges CHAR(12),'+
                 'PRIMARY KEY (id));', 
                 errhandler);

    client.query('CREATE TABLE '+TAG_TABLE+
                 '(postid INT(11), '+
                 'tag CHAR(24), '+
                 'PRIMARY KEY (postid, tag));', 
                 errhandler);

    client.query('CREATE TABLE '+FRIEND_TABLE+
                 '(user VARCHAR(225), '+
                 'friend VARCHAR(225),'+
                 'PRIMARY KEY (user, friend));',
                 errhandler);
    

  }
  
});

var geodb = exports;

exports.createUser = function(username, pass, res){

  client.query('SELECT * FROM '+USER_TABLE+
               ' WHERE user = ?',
               [username],

               function(err, results, fields){
                 if(err)
                   throw err;

                 if(results.length > 0){
                   serverLog('User '+username+' exists!');
                   res.writeHead(200, {'Content-Type':'text/html'});
                   res.write('Username already exists</br>');
                   res.write(' <a href="../newuser.html"> ');
                   res.write('Try Again </a>');
                   res.end('\n');
                 } else {
                   client.query('INSERT INTO '+USER_TABLE+' '+
                                'SET user = ?, pass = ?',
                                [username, pass],
                                errhandler);
                   serverLog('User '+username+' created!');
                   res.writeHead(200, {'Content-Type':'text/html'});
                   res.write('Account Created\n');
                   res.write(' <a href="../"> ');
                   res.write('Start posting!</a>');
                   res.end('\n');
                 }
               });
}


exports.createPost = function(username, pass, content, geohash, res){
  client.query('SELECT * FROM '+USER_TABLE+
               ' WHERE user = ?',
               [username],
               function(err, results, fields){
                 if(err)
                   throw err;
                 
                 if(results[0]){
                   if(results[0].user == username &&
                      results[0].pass == pass){
                     client.query('INSERT INTO '+POST_TABLE+' '+
                                  'SET owner = ?, content = ?, geohash = ?',
                                  [username, content, geohash],
                                  errhandler);
                     res.writeHead(302, { 'Location': '/'+geohash });
                     res.end();
                   } else {
                     serverLog('Invalid password for '+username+
                               ' attempted to post');
                     serverLog('Invalid user '+username);
                     res.writeHead(200, { 'Content-Type' :'text/html' });
                     res.write('Invalid password for '+username+'<br/>');
                     res.write(' <a href="../"> ');
                     res.write('Go Back</a>');
                     res.end('\n');
                   }
                 }else {
                   serverLog('Invalid user '+username);
                   res.writeHead(200, { 'Content-Type' :'text/html' });
                   res.write('User '+username+' does not exist<br/>');
                   res.write(' <a href="../"> ');
                   res.write('Go Back</a>');
                   res.end('\n');
                 }
               });
}

exports.getPostsByHash = function(res, geohash){
  //query to see if user is in database
  var stmt = 'SELECT * FROM '+POST_TABLE+' '+
    'WHERE geohash like ?';
  
  client.query(stmt, [geohash+'%'],
               function(err, results, fields){
                 if(err)
                   throw err;
                 serverLog(geohash+'# query with '+results.length+' results');
                 res.end(JSON.stringify(results));
               });
}

exports.getPostsByUser = function(res, user){
  //query to see if user is in database
  var stmt = 'SELECT * FROM '+POST_TABLE+' '+
    'WHERE owner = ?';
  client.query(stmt, [user],
               function(err, results, fields){
                 if(err)
                   throw err;
                 res.end(JSON.stringify(results));
               });
}