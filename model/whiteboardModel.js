var mongoose = require("mongoose");

var WhiteboardSchema = mongoose.Schema({
	updated: Date,
	workspace: String,
	state: [String]
});

/*
paramater: a list string representation of whiteboard objects 
*/
WhiteboardSchema.methods.saveBoard = function(strokes){
	this.state.push(strokes);
	this.save();
}

WhiteboardSchema.methods.clearBoard = function(){
	this.state = []
	this.save();
}

var Whiteboard = mongoose.model("Whiteboard", WhiteboardSchema);

module.exports = Whiteboard;

console.log("created whiteboard");
