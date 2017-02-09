var assert = require("assert");
var Workspace = require('../model/workspacemodel');
var Chat = require('../model/chatmodel');



describe('Chat', function() {
  describe('#sendMessage()',function(){
    var msgObj = {sender: "username", content: "hello", wsname: "workspaceName"}
    var serializedMsg = "{sender: 'username', content: 'hello', wsname: 'workspaceName'}"
    Chat.create({
      workspace: "workspaceName",
      messages: []
    });

    it('should create new message in database', function(done){
      Chat.findOne({
        workspace: "workspaceName"
        },function(err,chatroom){
          if (chatroom !== null)
          {
            chatroom.sendMessage(serializedMsg);
          }
        });

      Chat.findOne({
        workspace: "workspaceName"
      },function(err,success){
        if (success){
          assert.deepEqual(success.messages[0],serializedMsg);
        }
      });

      return done();
    });
  });


}); // End describe chat.
