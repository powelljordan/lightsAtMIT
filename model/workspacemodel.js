var mongoose = require('mongoose');

var workspaceSchema = mongoose.Schema({
	name: String,
	//This shows whether it's a default or non-default workspace (i.e. whether everyone can join)
	defaulted: Boolean,
	classes:[String],
	users: [String],
	whiteboard: {type: mongoose.Schema.Types.ObjectId, ref: 'Whiteboard'},
	chatroom: {type: mongoose.Schema.Types.ObjectId, ref: 'Chatroom'},
	music: [String] //to work on
})


workspaceSchema.methods.addClass = function(classId){
	this.classes.push(classId);
	this.save();
}

workspaceSchema.methods.removeClass = function(classId){
	this.classes = this.classes.filter(function(el){
		return el !== classId;
	});
	this.save();
}

workspaceSchema.methods.userEnter = function(user){
	this.users.push(user);
	this.save();
}

workspaceSchema.methods.link = function(whiteboard,chatroom){
	this.whiteboard = whiteboard;
	this.chatroom = chatroom;
	this.save()
}

workspaceSchema.methods.userLeave = function(user, callback){
	this.users = this.users.filter(function(el){
		return el !== user;
	});
	this.save();
	callback();
}


module.exports = mongoose.model("Workspace", workspaceSchema);