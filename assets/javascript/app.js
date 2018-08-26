var playerName;
var wins = 0;
var losses = 0;
var ties = 0;
var userid;
var currentPlayers;
var playerSpot = -1;
var opponentSpot;

var config = {
    apiKey: "AIzaSyCyReM-YdixMVFjlHkqf9LW7Q-V_9FF3bo",
    authDomain: "farley-87f66.firebaseapp.com",
    databaseURL: "https://farley-87f66.firebaseio.com",
    projectId: "farley-87f66",
    storageBucket: "farley-87f66.appspot.com",
    messagingSenderId: "568494919953"
};
firebase.initializeApp(config);
var database = firebase.database();
var playerRef = database.ref("/players");
var connectionsRef = database.ref("/connections");
var chatRef = database.ref("/chat");

$(function(){
    
    $("#player-add").on("click", function(event){
        event.preventDefault();
        playerName = $("#player-name").val().trim();
        $("#name-input-row").hide();
        $("#welcome-message").show();
        $(".boxes").addClass("show");
        $(".queuebox").addClass("show");
        $("#player1-name").text(playerName);

        var connect = connectionsRef.push({playername: playerName});
        userid = connect.key;
        connect.onDisconnect().remove();

        if(currentPlayers){
            checkIfPlaying();
        }
    });
     
    function checkIfPlaying(){
        playerSpot = currentPlayers.indexOf(userid);
        if(playerSpot === 0){
            opponentSpot = 1;
        }
        else{
            opponentSpot = 0;
        }
        if(playerSpot != -1){
            database.ref("/players/" + playerSpot).set({
                choice: "none",
            })
            $("#welcome-message").html(playerName+", Make a choice...");
            $(".chatbox").addClass("show");
            showRPS();
        }
        else{
            $("#welcome-message").html("Other players currently playing, please wait...");
        }
    }

    connectionsRef.on("value", function(snap){
        if(snap.val()){
            snapKeys = Object.keys(snap.val());
            var users = snap.val();
            $("#queue").empty();
            for(var i = 0; i < snapKeys.length; i++){
                
                $("#queue").append(users[snapKeys[i]].playername,"<br>");
            }

        }

    });

    connectionsRef.limitToFirst(2).on("value", function(snap){
        if(snap.val()){
            snapKeys = Object.keys(snap.val());
            if(snapKeys.length === 2){

                currentPlayers = snapKeys;
                checkIfPlaying();

            }
            else{
                $("#welcome-message").html("Waiting for opponent...");
            }

        }
    })

    playerRef.on("value", function (snap) {
        if (playerSpot === 0 || playerSpot === 1) {
            if(snap.val()[opponentSpot]){
                var opponentChoice = snap.val()[opponentSpot].choice;
                var playerChoice = snap.val()[playerSpot].choice;
            }

            if (opponentChoice !== "none" && playerChoice !== "none") {
                if ((playerChoice === "rock" && opponentChoice === "scissors") ||
                (playerChoice === "paper" && opponentChoice === "rock") ||
                (playerChoice === "scissors" && opponentChoice === "paper")){
                    wins++;
                    $("#player1-wins").text("Wins: "+wins);
                    $("#welcome-message").text("You Win!");
                    database.ref("/players/" + playerSpot).set({
                        choice: "none",
                    });
                    setTimeout(showRPS, 3000);
                }
                else if ((opponentChoice === "rock" && playerChoice === "scissors") ||
                        (opponentChoice === "paper" && playerChoice === "rock") ||
                        (opponentChoice === "scissors" && playerChoice === "paper")){
                    losses++;
                    $("#player1-losses").text("Losses: "+losses);
                    $("#welcome-message").text("You Lose!");
                    database.ref("/players/" + playerSpot).set({
                        choice: "none",
                    });
                    setTimeout(showRPS, 3000);
                }
                else if ((opponentChoice === "rock" && playerChoice === "rock") ||
                (opponentChoice === "paper" && playerChoice === "paper") ||
                (opponentChoice === "scissors" && playerChoice === "scissors")){
                    ties++;
                    $("#player1-ties").text("Ties: "+ties);
                    $("#welcome-message").text("It's a tie!");
                    database.ref("/players/" + playerSpot).set({
                        choice: "none",
                    });
                    setTimeout(showRPS, 3000);
                }
            }
        }
    })
        
    function showRPS(){
        $("#player1-choice").text("");
        var choices = $("<div>").addClass("row");
        var rockCol = $("<div>").addClass("col-4");
        var rock = $("<button class='btn btn-option'>").text("rock");
        rockCol.append(rock);
        var paperCol = $("<div>").addClass("col-4");
        var paper = $("<button class='btn btn-option'>").text("paper");
        paperCol.append(paper);
        var scissorsCol = $("<div>").addClass("col-4");
        var scissors = $("<button class='btn btn-option'>").text("scissors");
        scissorsCol.append(scissors);

        choices.append(rockCol);
        choices.append(paperCol);
        choices.append(scissorsCol);

        $("#player1-choices").empty();
        $("#player1-choices").append(choices);
        $("#welcome-message").text(playerName+", Make a choice...");
    
    }

    $("body").on("click",".btn-option", function(e){
       $("#welcome-message").text("Waiting on opponent...");
       $("#player1-choice").text("You chose: "+$(this).text());
       $(".btn-option").attr("disabled","true");
       $(this).attr("disabled","false");
        database.ref("/players/" + playerSpot).set({
            choice: $(this).text()
        })

    })

    chatRef.on("child_added", function(snapshot){

        //grab the value for key "message" from snapshot
        console.log(snapshot.val().message);
        //display it in the chat-display
        $("#chat-display").append(snapshot.val().name,": ",snapshot.val().message,"<br>");
    
      },function (errorObject) {
        console.log("The read failed: " + errorObject.code);
      });
    
      //when submit button is clicked
      $("#chat-submit").on("click", function(event){
    
        //prevent refresh
        event.preventDefault();
        //grab message from chat-input
        var chatInput = $("#chat-input").val();
        
        //go to the "posts" child of the database and create a reference
        var chatsRef = database.ref("/chat");
        //create a reference to the newly pushed child which has a unique identifier
        chatsRef.push({
          message:chatInput,
          name:playerName
        });
        $("#chat-input").val("");
    });
});