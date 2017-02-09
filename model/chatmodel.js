var fs = require('fs'); //file system
var mongoose = require('mongoose');

// https://gist.github.com/aheckmann/2408370
var ChatSchema = mongoose.Schema({
	messages:[String],
	workspace: String
});

// change user to user.username eventually / workspace
ChatSchema.methods.sendMessage = function(msg){
	this.messages.push(msg);
	this.save();
}


var Chat = mongoose.model('Chat', ChatSchema);
module.exports = Chat

console.log("created chat model");