var fs = require('fs');
var AWS = require('aws-sdk');
AWS.config.loadFromPath('./credentials.json');
var s3 = new AWS.S3();

var express = require("express");

var server = express();
var bodyParser = require('body-parser');
//var connect = require("connect");

var errorHandler = require('errorhandler');
var methodOverride = require('method-override');
var hostname = process.env.HOSTNAME || 'localhost';
var port = 8080;

//--------------assignment 6 update-----------------
server.use(methodOverride());
//app.use(bodyParser());
server.use(require('connect').bodyParser());
//server.use(connect.bodyParser());


// parse application/x-www-form-urlencoded
server.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
server.use(bodyParser.json())

server.use(express.static(__dirname + '/public'));
server.use(errorHandler());
//---------------------------------------------------

server.get("/", function (req, res) {
      res.redirect("/index.html");
});

var db = require('mongoskin').db('mongodb://user:pwd@127.0.0.1:27017/photos');

var todoList = [];



server.get("/addTodo", function (req, res) {
  db.collection("data").insert(req.query, function(err, result){
      if(err){
        res.send("error"); 
      }
      else{
        db.collection("data").find({}).toArray( function(err1, result1) {
          res.send(JSON.stringify(result1));
        });
      }
  });
   // todoList.push(req.query);
   // res.send(JSON.stringify(todoList));
});


server.get("/deleteTodo", function (req, res) {
   //var id = parseInt(req.query.id);
   var id = req.query.id.toString();
   console.log(id);
   db.collection("data").remove({id: id}, function(err, result){
     console.log(err);
      if(err){
        res.send("error"); 
      }
      else{
        db.collection("data").find({}).toArray( function(err1, result1) {
          res.send(JSON.stringify(result1));
        });
      }
   });
   // res.send(JSON.stringify(todoList));
   // todoList.splice(index,1);
});

server.get("/renamePhoto", function (req, res) {
   //var id = parseInt(req.query.id);
   var id = req.query.id.toString();
   var newName = req.query.name.toString();
   console.log(id);
   db.collection("data").update({id: id}, {$set: {name: newName} });

   db.collection("data").find({}).toArray( function(err, result) {
    res.send(JSON.stringify(result));
  });

  });

server.get("/getTodos", function (req, res) {
  db.collection("data").find({}).toArray( function(err, result) {
    res.send(JSON.stringify(result));
  });

   // res.send(JSON.stringify(todoList));
});

server.get("/getPhoto", function (req, res) {
  var id = req.query.id.toString();
  db.collection("data").findOne({id:id}, function(err, result) {
    res.send(JSON.stringify(result));
  });
});

server.post('/uploadFile', function(req, res){
      console.log(req.body);
        var intname = req.body.fileInput;
        var filename = req.files.input.name;
        var fileType =  req.files.input.type;
        var tmpPath = req.files.input.path;
        var s3Path = '/' + intname;
        
        fs.readFile(tmpPath, function (err, data) {
            var params = {
                Bucket:'ame470kb',
                ACL:'public-read',
                Key:intname,
                Body: data,
                ServerSideEncryption : 'AES256'
            };
            s3.putObject(params, function(err, data) {
                console.log(err);
                res.end("success");
            });
        });
  });

server.post('/uploadImage', function(req, res){
    var intname = req.body.fileInput;
    var s3Path = '/' + intname;
    var buf = new Buffer(req.body.data.replace(/^data:image\/\w+;base64,/, ""),'base64');
    var params = {
        Bucket:'ame470kb',
        ACL:'public-read',
        Key:intname,
        Body: buf,
        ServerSideEncryption : 'AES256'
    };
    s3.putObject(params, function(err, data) {
        console.log(err);
        res.end("success");
    });
});

server.get("/saveFilters", function (req, res) {
  var i = req.query.id.toString();
  var filt = req.query.filter.toString();
    
  db.collection("data").update({id: i}, {$set: {filter: filt}});
});

server.use(methodOverride());
server.use(bodyParser());
server.use(express.static(__dirname + '/public'));
server.use(errorHandler());

console.log("Simple static server listening at http://" + hostname + ":" + port);
server.listen(port);