var config = {
    apiKey: "AIzaSyBuk6m2J6ClAqrA-ERGB_V0KmzHm5ltE2A",
    authDomain: "hologlide-e8362.firebaseapp.com",
    databaseURL: "https://hologlide-e8362.firebaseio.com",
    storageBucket: "hologlide-e8362.appspot.com"
};
firebase.initializeApp(config);

var LEADERBOARD_SIZE = 5;
// Create our Firebase reference
var scoreListRef = firebase.database().ref('/Leaderboard-v1/');//new Firebase('https://an22sj9l915.firebaseio-demo.com//scoreList');//
// Keep a mapping of firebase locations to HTML elements, so we can move / remove elements as necessary.
var htmlForPath = {};
// Helper function that takes a new score snapshot and adds an appropriate row to our leaderboard table.
function handleScoreAdded(scoreSnapshot, prevScoreName) {
    var newScoreRow = $("<tr>");
    newScoreRow.append($("<td class=\"rank score__value\">"));
    // newScoreRow.append($("<td>").append($("<em>").text(scoreSnapshot.val().name)));
    newScoreRow.append($("<td>").text(scoreSnapshot.val().score));

    // Store a reference to the table row so we can get it again later.
    htmlForPath[scoreSnapshot.key] = newScoreRow;
    // Insert the new score in the appropriate place in the table.
    if (prevScoreName === null) {
        $("#leaderboardTable").append(newScoreRow);
    }
    else {
        var lowerScoreRow = htmlForPath[prevScoreName];
        lowerScoreRow.before(newScoreRow);
    }
}
// Helper function to handle a score object being removed; just removes the corresponding table row.
function handleScoreRemoved(scoreSnapshot) {
    var removedScoreRow = htmlForPath[scoreSnapshot.key];
    removedScoreRow.remove();
    delete htmlForPath[scoreSnapshot.key];
}
// Create a view to only receive callbacks for the last LEADERBOARD_SIZE scores
var scoreListView = scoreListRef.limitToLast(LEADERBOARD_SIZE);
// Add a callback to handle when a new score is added.
scoreListView.on('child_added', function (newScoreSnapshot, prevScoreName) {
    handleScoreAdded(newScoreSnapshot, prevScoreName);
    var newScore = newScoreSnapshot.val();
    console.log("key: " + newScoreSnapshot.key);
    console.log("name: " + newScore.name);
    console.log("score: " + newScore.score);
    console.log("located previouslly Post ID: " + prevScoreName);
});
// Add a callback to handle when a score is removed
scoreListView.on('child_removed', function (oldScoreSnapshot) {
    handleScoreRemoved(oldScoreSnapshot);
});
// Add a callback to handle when a score changes or moves positions.
var changedCallback = function (scoreSnapshot, prevScoreName) {
    handleScoreRemoved(scoreSnapshot);
    handleScoreAdded(scoreSnapshot, prevScoreName);
};
scoreListView.on('child_moved', changedCallback);
scoreListView.on('child_changed', changedCallback);


function pushNewRecord(name, newScore) {
    if (name === undefined){
        name = "NoName";
    }
    newScore = Number(newScore);
    var userScoreRef = scoreListRef.child(name + new Date().getTime());
    // Use setWithPriority to put the name / score in Firebase, and set the priority to be the score.
    userScoreRef.setWithPriority({ name: name, score: newScore }, newScore);
}


function showLeaderboard() {
    leaderboard.style.display = "block";
}

function hideLeaderboard() {
    leaderboard.style.display = "none";
}

var leaderboard;
function initLeaderboard() {
    leaderboard = document.getElementById("leaderboard");
}

window.addEventListener('load', initLeaderboard, false);

// export function for game.js
