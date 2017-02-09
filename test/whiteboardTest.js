var assert = require("assert");
var WB = require('../model/whiteboardModel');


describe('Whiteboard', function() {
  describe('#saveBoard()',function(){

     WB.create({
      workspace: "workspaceName",
      updated: Date.now,
      state: []
    });
     // {\"x\":423,\"y\":426,\"color\":\"#000000\",\"markerWidth\":\"1\"}
    it('should save the current state of thewhiteboard', function(done){
    	var pointsList = ["{\"x\":423,\"y\":426,\"color\":\"#000000\",\"markerWidth\":\"1\"}",
    	"{\"x\":425,\"y\":424,\"color\":\"#000000\",\"markerWidth\":\"1\"}"];

		WB.findOne({
        	workspace: "workspaceName"
        },function(err,wb){
          if (wb != null){
			wb.saveBoard(pointsList);
          } 
        });

        WB.findOne({
        	workspace: "workspaceName"
        },function(err,success){
          if (success){
			assert.deepEqual(success.state, pointsList);
          } 
        });

      return done();
    });
  });

  describe('#clearBoard()',function(){
    it('clear whiteboard state', function(done){

      	WB.create({
	      workspace: "workspaceName",
	      updated: Date.now,
	      state: ["{\"x\":423,\"y\":426,\"color\":\"#000000\",\"markerWidth\":\"1\"}",
    	"{\"x\":425,\"y\":424,\"color\":\"#000000\",\"markerWidth\":\"1\"}"]
	    });

        WB.findOne({
        	workspace: "workspaceName"
        },function(err,wb){
          if (wb != null){
			wb.clearBoard();
          } 
        });

        WB.findOne({
        	workspace: "workspaceName"
        },function(err,success){
          if (success){
			assert.deepEqual(success.state, []);
          } 
        });

      return done();
    });
  });

}); // End describe whiteboard.
