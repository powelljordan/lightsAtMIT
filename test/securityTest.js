var assert = require("assert");
var User = require('../model/usermodel');
var Workspace = require('../model/workspacemodel');
var WB = require('../model/whiteboardModel');
var Chat = require('../model/chatmodel');
var methods = require('../model/methods');

describe('user', function() {
	describe('#login()', function() {
		it('should add user successfully', function() {
			User.create({
				username : "john",
				password : 'password',
				workspace : "",
				location : ""
			});
						
			User.findOne({username : "john"}, function(err, user) {
				if (err)
					console.log(err);
				assert.equal(user.username, "john");
				assert.equal(user.password, "password");
			})
		});
	});
		
});

describe('Workspace', function() {
	describe('#joinRoom()', function() {
		it('should join user successfully', function() {
			User.create({
				username : "john",
				password : 'password',
				workspace : "",
				location : ""
			});
			methods.createWS("room");
			
			User.findOne({username : "john"}, function(err, user) {
				if (err) console.log(err);
				Workspace.findOne({name: "room"}, function(err, ws){
					if (err) console.log(err);
					user.enterRoom(ws.name);
					ws.userEnter(user.username);
					assert.equal(ws.users, ["john"]);
					assert.equal(user.workspace, ["room"]);
				});

			});
		});
	});
	
	describe('#leaveRoom()', function(){
		it('should leave successfully', function() {
			User.findOne({username : "john"}, function(err, user) {
				if (err) console.log(err);
				Workspace.findOne({name: "room"}, function(err, ws){
					if (err) console.log(err);
					user.leaveRoom();
					ws.userLeave(user.username);
					assert.equal(ws.users, []);
					assert.equal(user.workspace, []);
				});
			});
		});
	});
		
	
	describe('#leaveProcess()', function(){
		it('should leave successfully and delete room', function() {
			methods.createWS("room2", false);
			User.findOne({username : "john"}, function(err, user) {
				if (err) console.log(err);
				Workspace.findOne({name: "room2"}, function(err, ws){
					if (err) console.log(err);
					user.enterRoom(ws.name);
					ws.userEnter(user.username);
					assert.equal(ws.users, ["john"]);
					assert.equal(user.workspace, ["room2"]);
					methods.leaveProcess(user, ws);
				});
			});
			
			Workspace.findOne({name: "room2"}, function(err,ws){
				if (err) console.log(err);
				assert.equal(ws, null);
			})
			
			Chat.findOne({workspace: "room2"}, function(err, chat){
				if (err) console.log(err);
				assert.equal(chat, null);
			})
			WB.findOne({workspace: "room2"}, function(err, wb){
				if (err) console.log(err);
				assert.equal(wb, "");
			})

		});
	});
		
	
	
	
});