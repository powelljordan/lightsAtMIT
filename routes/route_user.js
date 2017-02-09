var express = require('express');
var router = express.Router();
var User = require('../model/usermodel');
var validator = require('validator');
var RateLimiter = require('limiter').RateLimiter;
var limiter = new RateLimiter(150, 'hour');
var Workspace = require('../model/workspacemodel');

/* GET registration page details page */
//router.get('/login', register.login);

module.exports = router;

/*
This function will check to see that the provided username-password combination
is valid. For empty username or password, or if the combination is not correct,
an error will be returned.

An user already logged in is not allowed to call the login API again; an attempt
to do so will result in an error code 403.

POST /users/login
Request body:
  - username
  - password
Response:
  - success: true if login succeeded; false otherwise
  - content: on success, an object with a single field 'user', the object of the logged in user
  - err: on error, an error message
*/

router.post('/login', function(req, res) {
    console.log("request is", req.body);
    console.log("username is ", req.body.username);
    console.log("username is type ", typeof(req.body.username));
    var username = req.body.username;
    var password = req.body.password;

    if (typeof username === "object") {
        username = JSON.stringify(username);
    }

    if (typeof password === "object") {
        password = JSON.stringify(password);
    }
    if ((username === "") || (password === "")) {
      res.send({success:2});
    } else {
      User.findOne({username: req.body.username}, function(err, user){
        console.log("trying to find user and user is: ", username);
        if (user !== null) {
          if (user.password === password){
      			req.session.username = username;
      			// show the UI page
      			res.send({success:0})
      		} else{
      			res.send({success:1})
      		}
        } else {
          res.send({success:3});
        }

    	});
    }
});

router.get('/login', function(req, res) {
    res.render('login');
});

/* Add username */
router.post('/register', function(req, res) {
    var name = req.body.username;
    var password = req.body.password;
    var confirm_password = req.body.confirm_password;
    if (typeof username === "object") {
        name = JSON.stringify(name);
    }

    if (typeof password === "object") {
        password = JSON.stringify(password);
    }

    if (name == ""){
        res.send({success:2});
    } else {
        if (password === confirm_password) {
            console.log("password and confirm-password are the same");
            User.find({username : name}, function(err, person) {
                if (person.length > 0) {
                    res.send({success:1})
                } else {
                    User.create({
                        username : name,
                        password : password,
                        workspace : null,
                        location: null
                    });
                    res.send({success: 0})
                };
          });
        } else {
            console.log("password and confirm_password are not the same and about to send response");
            //password and confirm_password aren't the same
            res.send({success:3});
        }
    };
});

router.get('/workspace', function(req, res, next) {
	if (req.session.username){
	    res.render('index', { title: 'Lights@MIT', current_user: req.session.username});
	} else{
		res.render('login');
	}
});

router.get('/current_user', function(req, res, next) {
   res.send({currentUser: req.session.username});
});

/*
 * POST /users/logout Request body: empty Response: - success: true if logout
 * succeeded; false otherwise - err: on error, an error message
 */
router.post('/logout', function(req, res) {
    console.log("logout request went through");
    User.findOne({username: req.session.username}, function(err, person){
        if (err) console.log(err);
        Workspace.findOne({name: person.workspace}, function(err, workspace){
            if (err) console.log(err);
            if (workspace !== null){
                workspace.userLeave(person.username, function(){
                    person.leaveRoom(function(){
                        console.log("left room and done");
                    })
                });
            };
        });
    })
    req.session.destroy();
    res.send({success:0});
});


//GET request: used to check user's existing workspaces
router.get('/oldWS', function(req, res, next) {
    if (req.session.username){
        User.findOne({username:req.session.username},function(err,person){
            if (err) res.send({success:1});
            if (person !== null){
                res.send({success:0, oldWS: person.workspace })
            }
        });
    } else{
        res.send({success:1});
    }
});
