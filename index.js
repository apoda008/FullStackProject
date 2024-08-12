// YOU CAN USE THIS FILE AS REFERENCE FOR SERVER DEVELOPMENT

// include the express modules
var express = require("express");

// create an express application
var app = express();
const url = require('url');

// helps in extracting the body portion of an incoming request stream
var bodyparser = require('body-parser'); // this has been depricated, is now part of express...

// fs module - provides an API for interacting with the file system
var fs = require("fs");

// helps in managing user sessions
var session = require('express-session');

// include the mysql module
var mysql = require("mysql");

// Bcrypt library for comparing password hashes
const bcrypt = require('bcrypt');

// A possible library to help reading uploaded file.
// var formidable = require('formidable')


// apply the body-parser middleware to all incoming requests
app.use(bodyparser());

// use express-session
// in mremory session is sufficient for this assignment
app.use(session({
  secret: "csci4131secretkey",
  saveUninitialized: true,
  resave: false
}
));


// server listens on port 9007 for incoming connections
app.listen(9007, () => console.log('Listening on port 9007!'));


var connection = mysql.createConnection({
  host: "cse-mysql-classes-01.cse.umn.edu",
  user: "C4131S24DU9",               // replace with the database user provided to you
  password: "131",                  // replace with the database password provided to you
  database: "C4131S24DU9",           // replace with the database user provided to you
  port: 3306
});


// function to return the welcome page
app.get('/',function(req, res) {
  res.sendFile(__dirname + '/static/html/welcome.html');
});

app.get('/login',function(req, res) {
  if(!req.session.value){
    res.sendFile(__dirname + '/static/html/login.html');
  } else {
    res.sendFile(__dirname + '/static/html/schedule.html');
  }
  
});


app.post('/login',function(req, res) {
  
    var data = req.body;
    var name = data["name"];
    var password = data["password"];
    console.log(data);

    queryInput = "SELECT * FROM tbl_accounts";
    

    connection.query(queryInput, function(err, row, fields) {
      
      if (err) throw err; 
      if (row.length >= 1){
        
        if (bcrypt.compareSync(password, row[0].acc_password)  == true){
          
          req.session.value = 1;
          res.json({status: 'success'});
          
        } else {
          res.json({status: 'fail'});
        }
      }else{
        res.json({status: 'fail'});
      }
      
    }); 
    
});


app.get('/schedule',function(req, res) {
  if(!req.session.value){
    res.sendFile(__dirname + '/static/html/login.html');
  } else {
    res.sendFile(__dirname + '/static/html/schedule.html');
  }
});

app.post('/schedule', function(req, res){
  var data = req.body;
  var day = data['day'];
  

  inputQuery = "SELECT * FROM tbl_events WHERE event_day = '" + day + "' " + "ORDER BY event_start ASC";
  connection.query(inputQuery, function(err, row, fields) {
    if (err) throw err;
    res.json(row);

  });
  
});

app.post('/addEvent', function(req, res) {
  var event_data = req.body
  
  const insertQuery = {
    event_day: event_data['day'],
    event_event: event_data['event'],
    event_start: event_data['start'],
    event_end: event_data['end'],
    event_location: event_data['location'],
    event_phone: event_data['phone'],
    event_info: event_data['info'],
    event_url: event_data['url'],
  }

  connection.query("INSERT tbl_events SET ?", insertQuery, function(err, row, fields) {
    if (err) throw err;
    res.sendFile(__dirname + "/static/html/schedule.html")
  });

  
  
});

app.get('/addEvent', function(req, res) {
  if(!req.session.value){
    res.sendFile(__dirname + '/static/html/login.html');
  } else {
    res.sendFile(__dirname + '/static/html/addEvent.html');
  }
});

app.get('/logout', function(req, res) {
  if(!req.session.value){
    res.sendFile(__dirname + '/static/html/login.html');
    console.log("not logged in - session not set")
  } else {
    req.session.destroy();
    console.log("Session Destroyed)")
    res.sendFile(__dirname + '/static/html/login.html');
  }
});

// middle ware to serve static files
app.use('/static', express.static(__dirname + '/static'));
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());


// function to return the 404 message and error to client
app.get('*', function(req, res) {
  // add details
  res.sendStatus(404);
});
