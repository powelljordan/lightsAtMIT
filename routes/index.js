var express = require('express');
var router = express.Router();
var User = require('../model/usermodel');
var Workspace = require('../model/workspacemodel');
var WB = require('../model/whiteboardModel');
var Chat = require('../model/chatmodel');
var methods = require('../model/methods');


var getDateStr = function () {
	  // We've seen that new/this can be a bad, but sometimes you'll see them in JavaScript code. For
	  // example, to create a date, you have to use new.
	  var date = new Date();
	  var dateStr = date.toLocaleString("en-us", 
	    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
	  return dateStr;
	}
//Set up of workspaces for MVP// 


var wsNames = ["awesome_people", "best_one", "superb_space","hello_space"];
var dateStr =  getDateStr();
wsNames.forEach(function(wsname){
	methods.createWS(wsname, true, function(){
		console.log("created");
	});
});


/* GET home page. */
router.get('/', function(req, res, next) {
	if (req.session.username){
	    res.render('index', { title: 'Lights@MIT', current_user: req.session.username});
	} else{
	    res.render('login');
	}
  //res.render('index', { title: 'Lights@MIT' });
});

// TODO: user authentication
// TODO: send actual current user and not the dummy "x0"
//router.get('/workspace', function(req, res, next) {
//    res.render('index', { title: 'Lights@MIT', current_user: 'x1'});
//});

//router.get('/login', function(req, res){
//	res.render('login');
//})

///* GET register page 
//author: labdalla */
//router.get('/register', function(req, res, next) {
//   res.render('register-page'); 
//});


module.exports = router;