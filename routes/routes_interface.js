var express = require('express');
var router = express.Router();
var User = require('../model/usermodel');
var Workspace = require('../model/workspacemodel');
var WB = require('../model/whiteboardModel');
var Chat = require('../model/chatmodel');
var methods = require('../model/methods');

module.exports = router;


///* Update location */
//router.post('/location', function(req, res) {
//	User.findOne({username : req.body.username}, function(err, person) {
//		if (err) console.log(err);
//		person.updateLocation(req.body.location)
//		res.send({success:true});
//		};
//	});
//});



var joinRoom = function(req, res){
	User.findOne({username : req.body.username}, function(err, person) {
		console.log(req.body);
		if (err) {res.send({success:1})}; //database error; can't find user
		//user is already in a room, 
		if (person.workspace !== null){ //user already in room
			res.send({success:1}); //error: can't join room if already in a room
		} else{ //not currently in a room
			//finding the workspace the user just clicked on
			Workspace.findOne({name: req.body.wsname}, function(err, ws){
				ws.userEnter(person.username);
				person.enterRoom(ws.name);
				//load workspace's chatroom
				Chat.findOne({_id: ws.chatroom},function(err,chat){
					if (err) res.send({success:1}); //database error; can't find chat
					//finds the chatroom
					if (chat !== null){
						//load whiteboard's chatroom
						WB.findOne({_id: ws.whiteboard},function(err,wb){
							if (err) {res.send({success:1})}; //database error: can't find wb
							if (wb !== null){
								res.send({success:0, messages: chat.messages, strokes: wb.state});
							}
							else{
								res.send({success:1}); //error: wb is null
							}
						}); //end loading whiteboard
					}else{
						res.send({success: 1}); //error: chat is null
					};
				});
			});
		}
	});
}


//note invariant: every workspace in the database has both a chatroom and whiteboard.
//a workspace's chatroom and whiteboard cannot be null

/* Join Room */
router.post('/joinroom', function(req, res) {
	console.log("current user who called this is:", req.body.username);
	Workspace.findOne({name: req.body.wsname}, function(err, ws){
		if (ws == null){
			methods.createWS(req.body.wsname, false, function(){
				User.findOne({username : req.body.username}, function(err, person) {
					console.log(req.body);
					if (err) {res.send({success:1})}; //database error; can't find user
					//user is already in a room, 
					if (person.workspace !== null){ //user already in room
						res.send({success:1}); //error: can't join room if already in a room
					} else{ //not currently in a room
						//finding the workspace the user just clicked on
						Workspace.findOne({name: req.body.wsname}, function(err, ws){
							ws.userEnter(person.username);
							person.enterRoom(ws.name);
							console.log("person entered");
							//load workspace's chatroom
							Chat.findOne({_id: ws.chatroom},function(err,chat){
								console.log("WHERE IS THE CHAT?", chat);
								if (err) res.send({success:1}); //database error; can't find chat
								//finds the chatroom
								if (chat !== null){
									//load whiteboard's chatroom
									WB.findOne({_id: ws.whiteboard},function(err,wb){
										if (err) {res.send({success:1})}; //database error: can't find wb
										if (wb !== null){
											res.send({success:0, messages: chat.messages, strokes: wb.state});
										}
										else{
											res.send({success:1}); //error: wb is null
										}
									}); //end loading whiteboard
								}else{
									res.send({success: 1}); //error: chat is null
								};
							});
						});
					};
				});
			})	
		} else{
			joinRoom(req, res);
		}
	});
});


/* Leave Room */
router.post('/leaveroom', function(req, res) {
	User.findOne({username : req.session.username}, function(err, person) {
		if (err) console.log(err);
		// console.log(person);
		//first, remove user from the workspace
		if (person.workspace !== null){
			Workspace.findOne({name: person.workspace}, function(err, workspace){
				if (workspace !== null){
					methods.leaveProcess(person, workspace);
					res.send({success:0});
				}
				else{
					res.send({success: 1})
				}
			});
		}
	});
});


var getDateStr = function () {
	  // We've seen that new/this can be a bad, but sometimes you'll see them in JavaScript code. For
	  // example, to create a date, you have to use new.
	  var date = new Date();
	  var dateStr = date.toLocaleString("en-us", 
	    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
	  return dateStr;
}


//POST a message
router.post('/create/message', function(req, res) {
    // console.log("successfully posted message: ",req.body.message);
    Chat.findOne({
		workspace: req.body.wsname //is this right?
	},function(err,chat){
		if (err) console.log("ERROR finding chat");
		if (chat !== null){
			// console.log("SENDING MESSAGE NAO");
			chat.sendMessage(req.body.message);
			res.send({success:0});
		}
		else{
			res.send({success: 1})
		}
	});
    

});


//REJOIN ROOM
router.post('/rejoinroom', function(req, res) {
	// console.log("REJOINING ROOM");
	User.findOne({username : req.body.username}, function(err, person) {
		if (err) {res.send({success:1})}; //database error; can't find user

		//finding the workspace the user just clicked on
		Workspace.findOne({name: req.body.wsname}, function(err, ws){
			//load workspace's chatroom
			Chat.findOne({_id: ws.chatroom},function(err,chat){
				if (err) res.send({success:1}); //database error; can't find chat
				//finds the chatroom
				if (chat !== null){
					//load whiteboard's chatroom
					WB.findOne({_id: ws.whiteboard},function(err,wb){
						if (err) {res.send({success:1})}; //database error: can't find wb
						if (wb !== null){
							res.send({success:0, messages: chat.messages, strokes: wb.state});
						}
						else{
							res.send({success:1}); //error: wb is null
						}
					}); //end loading whiteboard
				}else{
					res.send({success: 1}); //error: chat is null
				};
			});
		});
	});
});

//WHITEBOARD

router.post('/whiteboard', function(req,res){
	WB.findOne({
		workspace: req.body.wsname 
	},function(err,wb){
		if (err) {
			// console.log("ERROR finding wb");
		}
		if (wb !== null){
			wb.saveBoard(req.body.strokes);
			res.send({success:0});
		}else{
			res.send({success: 1})
		}
	});
});

//clear board
router.post('/clearBoard', function(req,res){
	WB.findOne({
		workspace: req.body.wsname 
	},function(err,wb){
		if (err) console.log("ERROR finding wb");
		if (wb !== null){
			// console.log("BEFORE LENGTH: ", wb.state.length);
			wb.clearBoard();
			// console.log("AFTER LENGTH: ", wb.state.length);
			res.send({success:0});
		}else{
			res.send({success: 1})
		}
	});
});