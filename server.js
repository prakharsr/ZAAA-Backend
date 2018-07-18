
var cors = require('cors');
var express = require('express');
var app  = express();
var mongoose = require('mongoose');
var config = require('./config');
var port = config.PORT;
var morgan = require('morgan');
var bodyParser = require('body-parser');
var path = require('path');
var auth  =require('./api/middleware/auth');

var corsOptions = {
    "origin": "*",
    "responseHeader": "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    "method": "POST, GET, PUT,PATCH, DELETE, OPTIONS",
    "maxAgeSeconds": 120
  }

app.use(cors(corsOptions));


var jwt = require('jsonwebtoken');

var passport = require("passport");
var passportJWT = require("passport-jwt");

var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use('/api', auth, require('./api/routes/router'));
app.use('/adminapi', require('./admin/routes/router'));
//app.use('/admin', require('./admin/routes/router'));

mongoose.connect('mongodb://localhost/zaaaDB', function(err){
	if(err){
		console.log('FAILED TO CONNECT' + err);
	}
	else{
		console.log('connected to database');
	}
});

app.get('*', function(req,res){
	res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
});
app.listen(port, function(){
	console.log('listening on port ' + port);
})
