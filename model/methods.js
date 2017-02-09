var User = require('./usermodel');
var Workspace = require('./workspacemodel');
var WB = require('./whiteboardModel');
var Chat = require('./chatmodel');

var getDateStr = function () {
	  // We've seen that new/this can be a bad, but sometimes you'll see them in JavaScript code. For
	  // example, to create a date, you have to use new.
	  var date = new Date();
	  var dateStr = date.toLocaleString("en-us", 
	    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
	  return dateStr;
	}

var dateStr =  getDateStr();

var createWS = function(wsname, defaulted, callback){
	Workspace.findOne({name: wsname}, function(err, ws){
		if (ws == null){
			Chat.create({
				messages: [],
				workspace: wsname
			}, function(){
				WB.create({
					updated: dateStr,
					workspace: wsname,
					state: []
				}, function(){
					Chat.findOne({workspace: wsname}, function(err, Chat){
						WB.findOne({workspace : wsname}, function(err, WB) {
							Workspace.create({
								name : wsname,
								defaulted : defaulted,
								classes : [],
								users : [],
								whiteboard : WB,
								chatroom : Chat,
								music : []
							}, callback);
						});
					});	
				});
			});
		};
	});	
};

var leaveProcess = function(person, workspace){
	workspace.userLeave(person.username, function(){
		person.leaveRoom(function(){
			if (workspace.users.length == 0 && !workspace.defaulted){
				Chat.findOne({workspace: workspace.name}, function(err, chat){
					chat.remove();
				})
				WB.findOne({workspace: workspace.name}, function(err, wb){
					wb.remove();
				});
				workspace.remove();
			};
		});
	});
};


module.exports.leaveProcess = leaveProcess;
module.exports.createWS = createWS;