
//pseudo-model for real time updating of non-persistent, but time sensitive activity such as online users
//messages are loaded from the database and so are whiteboards and so this field should be removed
var currentWorkspaces = {"awesome_people":{users : [], whiteboard : []},
                        "best_one":{users:[], whiteboard : []},
                         "superb_space":{users:[], whiteboard:[]},
                         "hello_space":{users:[], whiteboard:[]}};
var currentUsers = [];
var availableOnlineUsers = [];
var inWorkspace = function(user){
  for(var workspace in currentWorkspaces){
    for(var index in currentWorkspaces[workspace].users){
      var wsUser = currentWorkspaces[workspace].users[index];
      if(wsUser.name === user.name){
        return true;
      }
    }
  }
  return false;
}



module.exports = {
availableOnlineUsers:availableOnlineUsers,
currentWorkspaces:currentWorkspaces,
currentUsers:currentUsers,
inWorkspace:inWorkspace,
}