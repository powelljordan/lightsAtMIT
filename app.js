//var csrf = require('csurf');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var helmet = require('helmet');

var route_user = require('./routes/route_user');
var index = require('./routes/index');
var route_int = require('./routes/routes_interface');

////////////////////////////////////////////////////////////////
// DATABASE SETUP
var mongoose = require('mongoose');
// var MONGOLAB_URI = 'mongodb://heroku_cc33w7b6:v710ordst4bsu8hn0i59h7uajj@ds057954.mongolab.com:57954/heroku_cc33w7b6';
// mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/lights');
mongoose.connect(process.env.OPENSHIFT_MONGODB_DB_URL ||
'mongodb://localhost/lights'); // connect to our database
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
    console.log("database connected");
});
///////////////////////////////////////////////////////////////


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret : '6170', resave : true, saveUninitialized : true }));

app.use('/', index);
app.use('/user', route_user);
app.use('/workspace', route_int);

//security
//app.use(csrf());
app.use(helmet());




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

//Authentication middleware. This function
//is called on _every_ request and populates
//the req.currentUser field with the logged-in
//user object based off the username provided
//in the session variable (accessed by the
//encrypted cookie).
app.use(function(req, res, next) {
	if (req.session.username) {
		console.log("current username:", req.session.username);
		User.findOne({username: req.session.username}, function(err, user) {
			if (user) {
				req.currentUser = user;
			} else {
				req.session.destroy();
			}
			next();
		});
	} else {
		console.log("no one is logged on");
		next();
	}
});


// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
