$(document).ready(function() {
    $("#register-link-button").click(function(event) {
        console.log("clicked on the register link!");
        $("#login-register-segment").remove();
        // TODO: were the form tags added correctly below??
        $("body").append("<div id=\"outer-segment\" class=\"basic segment\">"
                         + "<div id=\"register-segment\" class=\"ui red segment ui raised segment\">"
                         + "<p id=\"register-paragraph\">Register</p>"
                         + "<div class=\"ui form\">"
                         + "<div class=\"field\">"
                         + "<div id=\"username-input\" class=\"ui left icon input\">"
                         + "<input id=\"username\" type=\"text\" placeholder=\"Username\">"
                         + "<i class=\"user icon\"></i>"
                         + "</div>"
                         + "</div>"
                         + "<div class=\"field\">"
                         + "<div id=\"password-input\" class=\"ui left icon input\">"
                         + "<input id=\"password\" type=\"password\" placeholder=\"Password\">"
                         + "<i class=\"lock icon\"></i>"
                         + "</div>"
                         + "</div>"
                         + "<div id=\"confirm-password-field\" class=\"field\">"
                         + "<div id=\"confirm-password-input\" class=\"ui right labeled left icon input\">"
                         + "<i class=\"lock icon\"></i>"
                         + "<input id=\"confirm_password\" type=\"password\" placeholder=\"Confirm Password\">"
                         + "<div id=\"confirm-status\" class=\"ui label\">"
                         + "<i class=\"checkmark icon\"></i>"
                         + "</div>"
                         + "</div>"
                         + "</div>"
                         + "</div>"
                         + "</div>"
                         + "<button id=\"register-button\" class=\"ui red submit button\">Register</button>"
                         + "</div>");

        $("#confirm_password").keyup(function(event){
            var input_password = $("#password").val();
            var input_confirm_password = $("#confirm_password").val();
           if (input_password === input_confirm_password) {
             $("#confirm-status").addClass("green");
           } else {
             $("#confirm-status").removeClass("green");
           }
        });

        $("#confirm_password").keypress(function(event) {
          if (event.which === 13) { //user hits enter
            registerLogic();
          }
        });

        $("#register-button").click(function(event) {
          registerLogic();
        });

        var registerLogic = function() {
          var input_username = $("#username").val();
          var input_password = $("#password").val();
          var input_confirm_password = $("#confirm_password").val();
          console.log("confirm_password is: ", input_confirm_password);
          console.log("username is a ", input_username);
          console.log("password is a ", input_password);
         $.post("/user/register", {username: input_username, password: input_password, confirm_password: input_confirm_password}, function(data) {
           console.log("data is: ", data);
             if (data.success === 0) { //post request goes through
               addMessageFeedback("outer-segment", "Your account was successfully created", "<a class=\"link\" href=\"/user/login\">Go to Login</a>", "register-success-message");


             } else if (data.success === 1) { //username is already taken
                addMessageFeedback("outer-segment", "This username is already taken", "Please use another username.", "register-name-taken-message");
                $("#username").val("");
                $("#password").val("");
                $("#confirm_password").val("");

             } else if (data.success === 2) { //empty username or password
                addMessageFeedback("outer-segment", "You must enter both a username and password", "Please use another username and/or pasword.", "register-empty-name-message");

             } else { //data.sucess === 3 means the password and confirmed password aren't the same
                addMessageFeedback("outer-segment", "The passwords you entered don't match", "Please make sure both passwords are the same.", "register-pw-cpw-message");
                $("#password").val("");
                $("#confirm_password").val("");
             }
         });
        }
    });

    $("#sign-in-button").click(function(event) {
      signInLogic();
    });

    $("#login-password").keypress(function(event) {
      if (event.which === 13) { //user hits enter
        signInLogic();
      }
    });


    var signInLogic = function() {
      var login_username = $("#login-username").val();
      var login_password = $("#login-password").val();
     $.post("/user/login", {username: login_username, password: login_password}, function(data) {
         if (data.success === 0) {
             window.location = "/user/workspace";
         } else if (data.success === 1) { //wrong password
           addMessageFeedback("login-register-segment", "That username and password combination is incorrect", "", "incorrect-password-message");
           $("#login-username").val("");
           $("#login-password").val("");
         } else if (data.success === 2){ //data.success === 2 means empty user
           addMessageFeedback("login-register-segment", "You must enter a valid username and password", "", "empty-username-for-login-message");
         } else { //data.success === 3 means username not found
           addMessageFeedback("login-register-segment", "That username does not exist", "Please use a different username.", "non-existing-username-for-login-message");
           $("#login-username").val("");
           $("#login-password").val("");
         }
     });
    }

    var addMessageFeedback = function(segmentID, header_message, paragraph_message, div_id) {
      if ($(".ui.message")) {
        $(".ui.message").remove();
      }
        $("#" + segmentID).append("<div id=\"" + div_id + "\" class=\"ui message\">"
                                   + "<i class=\"close icon\"></i>"
                                   + "<div class=\"header register\">" + header_message + "</div>"
                                   + "<p class=\"register\">" + paragraph_message + "</p>"
                                   + "</div>");
        $(".close.icon").click(function(event) {
          $(".ui.message").remove();
        });
    }

});
