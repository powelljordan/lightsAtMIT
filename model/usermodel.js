var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	username: String,
	password: String,
	workspace: String,
	location: {place: String, coords: {x: Number, y: Number}}
})


userSchema.methods.enterRoom = function(workspace){
	if (this.workspace == null){
		this.workspace = workspace;
	}
	this.save();
}

userSchema.methods.leaveRoom = function(callback){
	if (this.workspace !== null){
		this.workspace = null;
	}
	this.save();
	callback();
}

userSchema.methods.updateLocation = function(location){
	var curLocation;
	this.location.place = curLocation.place;
	this.location.coords = curLocation.coords;
	this.save()
}

module.exports = mongoose.model("User", userSchema);
