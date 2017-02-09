lightsApp.controller('SidePanelController', ['$scope', '$http',
        function($scope, $http){
			$scope.tabContent = "Default";
			$scope.openTab = "None";
			$scope.currentWorkspaceName ="";
			$scope.colors = [{name:"black", code:"#000000"},{name:"red", code:"#F80000"},
							 {name:"blue", code:"#0000CC"}, {name:"green", code:"#00CC00"}]

			var canvas = document.getElementById("whiteboard");
			var context = canvas.getContext("2d");          
            $scope.currentUser = null;
            $("#chat").dimmer('show');
            $("#leaveRoom").dimmer('show');
            $('#chat').dimmer('setting',{closable:false});
            //get the current user
            $.get("/user/current_user", function(data) {
               $scope.currentUser = data.currentUser;
            });


			$scope.messages =[];
            $scope.currentStrokes = [];

            //for the create workspace requests
            $scope.collaborator = null;
            $scope.initiator = null;
            $scope.newWorkspaceName = null;
            $scope.clickedWorkspace = null;
            $scope.knockingUser = null;

            //$scope.currentUser = null;
			$scope.currentStrokes = [];
            $scope.userTyping = false;
			// $scope.results = [];
			$scope.peopleResults = [];
			$scope.workspaceResults = ["awesome_people", "best_one", "superb_space", "hello_space"];
            $scope.defaultWorkspaces = ["awesome_people", "best_one", "superb_space", "hello_space"];
			var enteredWorkspace = false;

			$scope.displayChat = function(){
                //get the messages then display the chat
                return $scope.openTab === "chat";

			}

			var notClosable = function(){
				$("#content-sidebar").sidebar('setting', {closable:false, dimPage:false});
			}

			$scope.newWorkspacePrompt = function(collaborator){
				if($scope.currentWorkspaceName === "" || $scope.currentWorkspaceName === "PEOPLE" || $scope.currentWorkspaceName === "WORKSPACES"){
	                console.log("clicked on the person to create a workspace");
	                $scope.collaborator = collaborator;
	                //$scope.$apply();
	                $("#individual-knock-request-modal").modal("show");
	            }	

			}

            $scope.emitNewWorkspaceRequest = function(collaborator) {
                var newWorkspace = $("#workspace-name-id").val();
                //if the new workspace name is not a default workspace name
                if ($scope.defaultWorkspaces.indexOf(newWorkspace) === -1) {
                    if (newWorkspace !== null) {
                        socket.emit("newWorkspaceRequest", {name:$scope.currentUser, sessionId:socket.io.engine.id}, collaborator, newWorkspace);
                        $("#individual-knock-request-modal").modal("hide");
                    }
                } else {
                    // TODO: make an error message appear or smth
                    console.log("you can't use this workspace name, it is a default workspace name");

                }


            }

            var newWorkspaceConfirmation = function(initiator, wsname){
                $scope.initiator = initiator;
                $scope.newWorkspaceName = wsname;
                $scope.$apply();
                $("#individual-knock-respond-modal").modal("show");

			}

            $scope.confirmWorkspace = function() {
                $scope.workspaceResults.push($scope.newWorkspaceName);
                $scope.joinWorkspace($scope.newWorkspaceName);
                socket.emit("workspaceConfirmed", $scope.newWorkspaceName, $scope.initiator);
                $("#individual-knock-respond-modal").modal("hide");
            }


			var removeWhiteSpace = function(someString){
				return someString.replace(/\s+/g, '_');
			}

			$scope.displayWorkspace = function(){
				return $scope.openTab === "workspaces";
			}

			$scope.displayPeople = function(){
				return $scope.openTab === "people"
			}

			$scope.toggleSidebar = function(){
				notClosable();
				$('#content-sidebar').sidebar('toggle');
			}

			$scope.handleToggles = function(tabName, content){
				if($scope.openTab === tabName){
					$scope.toggleSidebar();
					$scope.openTab = "None";
				}
				else{
					if($scope.openTab === "None"){
						$scope.toggleSidebar();
					}
					$scope.openTab = tabName;
					if($scope.currentWorkspaceName === "" || 
						$scope.currentWorkspaceName === "WORKSPACES" ||
							$scope.currentWorkspaceName === "PEOPLE"){
						$scope.currentWorkspaceName = content;
					}
					$scope.tabContent = content;
				}
			}

			$scope.populateChat = function(){
				if(enteredWorkspace){
					$scope.handleToggles("chat", "Send Message");
				}

			}

			$scope.populateWorkspaces = function(){
				if(!enteredWorkspace){
					$scope.handleToggles("workspaces", "WORKSPACES");
					context.clearRect(0, 0, canvas.width, canvas.height);
					context.font = "25px Arial";
					context.fillText("Choose a Workspace", canvas.width*.485, canvas.height*.4);
					context.fillText("on the left to join", canvas.width*.535, canvas.height*.5);
				}

			}

			$scope.populateWorkspaces();



			$scope.populatePeople = function(){
				// $scope.results = peopleResults;
				$scope.handleToggles("people", "PEOPLE");
				if(!enteredWorkspace){
					context.clearRect(0, 0, canvas.width, canvas.height);
					context.font = "25px Arial";
					context.fillText("Choose someone", canvas.width*.5, canvas.height*.4);
					context.fillText("to start working with", canvas.width*.485, canvas.height*.5);
				}
			}

			var socket = io();

            //when the user types in a message
            //and emits that change to the server
            //in www, you can find what the server does when it receives the message
			$scope.sendMessageIfEnter = function(event) {
				if (event.which === 13) {
					$scope.sendMessage();
				}
			}
			$scope.sendMessage = function(){
                var messageToSend = $('#chat-box-content').val();
                if (messageToSend.length ===0){
                    return
                }
                var messageTuple = {content: messageToSend, sender: $scope.currentUser, date: Date.now, file: {}};
                var messageInfo = {sender: $scope.currentUser, content: messageToSend, wsname: $scope.currentWorkspaceName};
				socket.emit('chat', messageInfo);
                // console.log("sent to socket server");

                var serializedMessage = angular.toJson(messageInfo);
                var serializedMsgObj = {'message': serializedMessage,wsname: $scope.currentWorkspaceName};

                $.post("/workspace/create/message", serializedMsgObj, function(data) {
                    if (data.success === 0){
                        // console.log("Successfully posted message in database");
                    }
                });
                $("#chat-box-content").val('');

                $("#chat-box-content").focus();

                return false
			}

            socket.on('connect', function(){
            	socket.emit('pageLoaded',{sessionId: socket.io.engine.id, name: $scope.currentUser});
            })
            //when the user receives a chat update from the server
			socket.on('chat', function(msgTuple) {

				$scope.messages.push(msgTuple);
				$scope.$apply();

                //to display the last chat message
                //from: http://stackoverflow.com/questions/7303948/how-to-auto-scroll-to-end-of-div-when-data-is-added
                var sentChatMsgElement = document.getElementById("sent-chat-messages");
                sentChatMsgElement.scrollTop = sentChatMsgElement.scrollHeight;


			});

			socket.on('newWorkspaceRequest', function(initiator, wsname){
				newWorkspaceConfirmation(initiator, wsname);
			});

			socket.on('workspaceConfirmed', function(wsname){
				$scope.joinWorkspace(wsname);
			});

			socket.on('workspaces', function(workspaces){
				// console.log(workspaces);
				$scope.workspaceResults = workspaces;
				$scope.$apply();
			});



            $scope.IsCurrentUser = function(username) {
                return username === $scope.currentUser;
            }

            $scope.handleWorkspaceClick = function(workspaceName) {
                //it's a default workspace
                if ($scope.defaultWorkspaces.indexOf(workspaceName) > -1) {
                    $scope.joinWorkspace(workspaceName);
                } else {
                    $scope.showKnockRequest(workspaceName);
                }
            }

            $scope.showKnockRequest = function(workspaceName) {
                $scope.clickedWorkspace = workspaceName;
                //$scope.$apply();
                $("#workspace-knock-request-modal").modal("show");
            }

            $scope.sendKnock = function(workspaceName) {
                var workspaceAndUser = {name: workspaceName, user: {sessionId: socket.io.engine.id, name: $scope.currentUser}}
                socket.emit("knock", workspaceAndUser);
                $("#workspace-knock-request-modal").modal("hide");
            }

            $scope.hideKnockRespond = function() {
                $("#workspace-knock-respond-modal").modal("hide");
            }

            $scope.hideKnockRequest = function() {
                $("#workspace-knock-request-modal").modal("hide");
            }

            $scope.hideCreateWorkspaceRespond = function() {
                $("#individual-knock-respond-modal").modal("hide");
            }

            $scope.joinWorkspace = function(workspaceName){
            	enteredWorkspace = true;
				$scope.populateChat();
				$("#workspaces").dimmer('show');
				$("#chat").dimmer('hide');
				$("#leaveRoom").dimmer('hide');
				// $(".pusher").dimmer('hide');
				joinWorkspaceLogic(workspaceName);
			}

            var loadFromDatabase = function(messages, strokes){
                $scope.messages = []
                //messages == ["{sender:, content:, wsname:}"]
                if (messages != null){
                    for (var i = messages.length-1; i >=0; i--){//only displays most recent 500
                        var parsed = $.parseJSON(messages[i]);
                        if ($scope.messages.length < 500){ 
                            $scope.messages.unshift(parsed); //adds to beginning of the array
                        }
                    }
                    $scope.$apply();
                }

                //strokes == [ '[{x:,y:,color:markerWidth}]']
                $scope.currentStrokes = []
                if (strokes != null){
                    strokes.forEach(function(strokeObj){
                        var parsed = $.parseJSON(strokeObj);
                        $scope.currentStrokes.push(parsed);
                    });

                }

                $scope.currentStrokes.forEach(function(arr){
                    // console.log("DRAWN!");
                    drawOnCanvas(arr); 
                });
            }
                        

            var joinWorkspaceLogic = function(workspaceName) {
                context.clearRect(0, 0, canvas.width, canvas.height);

                $scope.currentWorkspaceName = workspaceName;
                var workspaceAndUser = {name: workspaceName, user: {sessionId: socket.io.engine.id, name: $scope.currentUser}, custom:true}
                socket.emit('joinroom', workspaceAndUser);

                $.get("/user/oldWS", function(res){
                    if (res.success === 0){ //found the user's current ws
                        if (res.oldWS != null){ //ws before joining is not null! oh no!
                            if (res.oldWS === workspaceName){ //rejoining
                                $.post("/workspace/rejoinroom", {username: $scope.currentUser, wsname: workspaceName}, function(res) {
                                    if (res.success === 0){ //succesfully joining a room
                                        // console.log("REJOINING");
                                        loadFromDatabase(res.messages, res.strokes);
                                        $("#workspaces").dimmer('show');
                                        $("#chat").dimmer('hide');
                                        $("#leaveRoom").dimmer('hide');  
                                    }

                                });

                            }else{
                                $.post('/workspace/leaveroom',function(res){
                                // console.log("GOOD? ", res.success);
                                });
                            }
                        }
                    
                        ///after the fix above, it calls joinroom
                        $.post("/workspace/joinroom", {username: $scope.currentUser, wsname: workspaceName}, function(res) {
                            if (res.success === 0){ //succesfully joining a room
                                loadFromDatabase(res.messages, res.strokes);
                            }

                            //make an alert
                            console.log($scope.currentUser, "has joined the workspace: ", workspaceName);
                        });

                    }
                });
            }

            socket.on("showKnockResponseDialog", function(knockingUser){
                console.log("will show the knock response dialog");
                $scope.knockingUser = knockingUser;
                $scope.$apply();
                $("#workspace-knock-respond-modal").modal("show");
            });

            $scope.acceptKnockingUser = function(workspaceName, knockingUser) {
                $("#workspace-knock-respond-modal").modal("hide");
                socket.emit("userAccepted", workspaceName);

                socket.emit("knockSuccessfulToKnockingUser", knockingUser, workspaceName);
                var workspaceAndUser = {name: workspaceName, user: {sessionId: socket.io.engine.id, name: $scope.currentUser}}
                socket.emit('joinroom', workspaceAndUser);

            	$.get("/user/oldWS", function(res){
            		if (res.success === 0){ //found the user's current ws
            			// console.log("OLD WS: ", res.oldWS);
                   
                        if (res.oldWS === workspaceName){ //rejoining
                            $.post("/workspace/rejoinroom", {username: $scope.currentUser, wsname: workspaceName}, function(res) {
                                if (res.success === 0){ //succesfully joining a room
                                    // console.log("REJOINING");
                                    loadFromDatabase(res.messages, res.strokes);
                                    $("#workspaces").dimmer('show');
                                    $("#chat").dimmer('hide');
                                    $("#leaveRoom").dimmer('hide');  
                                }

                            });

                        }else{
                            $.post('/workspace/leaveroom',function(res){});
                        }

            		
            			///after the fix above, it calls joinroom
		                $.post("/workspace/joinroom", {username: $scope.currentUser, wsname: workspaceName}, function(res) {
		                    if (res.success === 0){ //succesfully joining a room
		                    	//messages == ["{sender:, content:, wsname:}"]
                                loadFromDatabase(res.messages, res.strokes);
		                    }

		                    //make an alert
		                    console.log($scope.currentUser, "has joined the workspace: ", workspaceName);
		                });

            		}
            	});
            }

            socket.on("userAccepted", function() {
                console.log("received the user accepted event");
                $("#workspace-knock-respond-modal").modal("hide");
            });

            socket.on("youWereAcceptedIntoWorkspace", function(workspaceName){
                console.log("I got the you-were-accepted msg");
                $scope.joinWorkspace(workspaceName);
            });

            //TODO: check leaving workspace if clicked twice
			$scope.leaveWorkspace = function(){
				var startsFalse = !enteredWorkspace;
				enteredWorkspace = false;
				$scope.messages = [];
				$("#workspaces").dimmer('hide');
				$("#chat").dimmer('show');
				$("#leaveRoom").dimmer('show');
				// $(".pusher").dimmer('show');
				if(!startsFalse){
					$scope.populateWorkspaces();
				}


				// console.log("server: leaveWorkspace() IS CALLED");
				if(!($scope.currentWorkspaceName in $scope.defaultWorkspaces)){
					var workspaceAndUser = {name: $scope.currentWorkspaceName, user: {sessionId: socket.io.engine.id, name: $scope.currentUser}, custom:true}
				}else{
					var workspaceAndUser = {name: $scope.currentWorkspaceName, user: {sessionId: socket.io.engine.id, name: $scope.currentUser}}
				}
                
				socket.emit('leave', workspaceAndUser);

            	$.post("/workspace/leaveroom", function(data) {
                	if (data.success === 0){
                		// console.log("Successfully left workspace")
                	}
                });
                $scope.currentWorkspaceName = "";
			}

			//CONCURRENT WHITEBOARD STUFF
			var otherPlots = [];

			socket.on('loadWhiteBoard', function(whiteboard){
				whiteboard.forEach(function(points){
					drawOnCanvas(points);
				});

				//Add loading scheen or something while whiteboard is loading
			});

			socket.on('drawEvent', function(plotsData){
				drawOnCanvas(plotsData.plots);
			});

			socket.on("clearBoard", function(){
				context.clearRect(0, 0, canvas.width, canvas.height);
			});

			socket.on('onlineUsers', function(onlineUserObjects){
				var onlineUserNames = [];
				onlineUserObjects.forEach(function(user){
					if(!(user.name in onlineUserNames) && user.name !== $scope.currentUser){
						onlineUserNames.push(user.name);
					}

				});
				$scope.peopleResults = onlineUserNames;
				$scope.$apply();
			});



			//WHITEBOARD STUFF
			// context.lineWidth = "1";
			var myMarkerWidth = "1";
			context.lineCap = "round"
			var myMarkerColor = "#000000"

			var isActive = false;
			var plots = []; //global variable..??
			$scope.draw = function(e){
				if(!isActive) return;
				var rect = canvas.getBoundingClientRect();

			  	var x = Math.round((e.clientX-rect.left)/(rect.right-rect.left)*canvas.width) ||
			  	(e.targetTouches[0].pageX - rect.left)/(rect.right-rect.left)*canvas.width;

			  	var y = Math.round((e.clientY-rect.top)/(rect.bottom-rect.top)*canvas.height) ||
			  	(e.targetTouches[0].pageY - rect.top)/(rect.bottom-rect.top)*canvas.height;

			  	plots.push({x:x, y:y, color:myMarkerColor, markerWidth: myMarkerWidth});
				plotsData = {wsname: $scope.currentWorkspaceName, plots:plots}
				socket.emit('drawEvent', plotsData);
			  	drawOnCanvas(plots);
			}

			var drawOnCanvas = function(plots){
				context.beginPath();
				context.moveTo(plots[0].x, plots[0].y);
				for(var i=1; i<plots.length-1; i++){
					context.strokeStyle = plots[i].color;
					context.lineWidth = plots[i].markerWidth;
					context.lineTo(plots[i].x, plots[i].y);
				}
				context.stroke();
			}

			$scope.startDraw = function(e){
				isActive = true;
			}

			$scope.endDraw = function(e){
				isActive = false
                var serializedPlots = angular.toJson(plots);
                var obj = {'strokes': serializedPlots, wsname: $scope.currentWorkspaceName};
                // console.log("PLOTS: ", typeof(plots), plots.length);
                $http({
                    url: '/workspace/whiteboard',
                    method: 'POST',
                    data: $.param(obj),
                    headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
                }).success(function(data){
                    console.log("SUCCESS WHITEBOARD");
                });

				plots = [];
			}

			$scope.eraser = function(){
				myMarkerColor = "#faebd7";
				myMarkerWidth = "10";
			}

			$scope.marker = function(color){
				myMarkerColor = color;
				myMarkerWidth = "1";
			}

			$scope.clearCanvas = function(){
				context.clearRect(0, 0, canvas.width, canvas.height);
				socket.emit("requestClear", {username: $scope.currentUser, wsname: $scope.currentWorkspaceName});
                $.post('/workspace/clearBoard',{wsname: $scope.currentWorkspaceName},function(res){
                    if (res.success === 0){
                        // console.log("WHITEBOARD CLEARED");
                    }
                });
            }
			$scope.download = function(){
        		canvas.toBlob(function(blob) {
					saveAs(blob, $scope.currentWorkspaceName+".png");
    			});
    		}
		}
	])
