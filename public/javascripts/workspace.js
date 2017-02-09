$(document).ready(function(){
    $("#logout-link").click(function(event) {
        console.log("logout link clicked");
       $.post("/user/logout", function(data) {
          if (data.success === 0) {
              console.log("success is 0");
              window.location = "/";
          } console.log("success is not 0");
       });
    });

    $("#leaveRoom").click(function(event) {
        $.post("/workspace/leaveRoom", function(data) {
           if (data.success === 0) {
               console.log("Workspace left");
           } else if (data.success === 1){
        	   console.log("did not leave/ currently not in workspace");
           }
        });
     });

});
