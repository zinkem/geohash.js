var mysql = require('mysql');
var DATABASE = 'geodb';
var USER_TABLE = 'users';
var POST_TABLE = 'posts'

var client = mysql.createClient({
  host: '127.0.0.1',
  user:'nodejs',
  password:'nodejs'
});

function errhandler(err){
  if(err)
    throw err;
}

client.query('CREATE DATABASE '+DATABASE, function(err){
  if(err){
    if(err.number != mysql.ERROR_DB_CREATE_EXISTS){
      throw err;
    } else {
      console.log("Database exists!");
      client.query('USE '+DATABASE);
    }
  } else {
    //initialize DB
    client.query('USE '+DATABASE);
    client.query('CREATE TABLE '+USER_TABLE+
                 '(user VARCHAR(225), '+
                 'pass VARCHAR(225), '+
                 'PRIMARY KEY (user))',
                 errhandler);

    client.query('CREATE TABLE '+POST_TABLE+
                 '(id int(11) AUTO_INCREMENT, '+
                 'owner VARCHAR(225), '+
                 'content VARCHAR(225), '+
                 'geohash CHAR(12), '+
                 'time TIMESTAMP, '+
                 'PRIMARY KEY (id))', errhandler);
  }
  
});

var geodb = exports;

exports.createUser = function(username, pass){
  client.query('INSERT INTO '+USER_TABLE+' '+
               'SET user = ?, pass = ?',
               [username, pass],
               errhandler);
}


exports.createPost = function(username, pass, content, geohash){
  client.query('INSERT INTO '+POST_TABLE+' '+
               'SET owner = ?, content = ?, geohash = ?',
               [username, content, geohash],
               errhandler);
}

exports.getPosts = function(res, geohash){

  //query to see if user is in database

  var stmt = 'SELECT * FROM '+POST_TABLE;
  client.query(stmt,
               function(err, results, fields){
                 if(err)
                   throw err;
                 res.end(JSON.stringify(results));
                 
               });
}