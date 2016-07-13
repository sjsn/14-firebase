'use strict';

var app = angular.module('ChirperApp', ['firebase']);

//For movie data browser
app.controller('ChirperCtrl', ['$scope', '$firebaseAuth', '$firebaseArray', '$firebaseObject', function($scope, $firebaseAuth, $firebaseArray, $firebaseObject) {

		var baseRef = firebase.database().ref();

		/* Authentication */
		var Auth = $firebaseAuth();
		$scope.newUser = {}; //for sign-in

		$scope.signUp = function() {

			// Create user
			Auth.$createUserWithEmailAndPassword($scope.newUser.email, $scope.newUser.password)
					.then(function(firebaseUser){ //first time log in
						console.log("signing up");
	    			$scope.userId = firebaseUser.uid; //save userId
						console.log(firebaseUser.uid);

						//save user info
						$scope.newUser.avatar = $scope.newUser.avatar || "img/no-user-pic.png"; //make "empty" if undefined

						var userData = {
							handle:$scope.newUser.handle,
							avatar:$scope.newUser.avatar,
						};

						var myRef = baseRef.child('users/'+firebaseUser.uid); //create new entry in object
						myRef.set(userData); //save that data to the database;
					})
 					.catch(function(error) {
          	console.log(error);
        	});
		};

		$scope.signIn = function() {
			Auth.$signInWithEmailAndPassword($scope.newUser.email,$scope.newUser.password);
		};

   	// any time auth state changes, add the user data to scope
  	Auth.$onAuthStateChanged(function(firebaseUser) {
			if(firebaseUser){
				console.log('logged in');
	      $scope.userId = firebaseUser.uid;

			}
			else {
				console.log('logged out');
				$scope.userId = undefined;
			}
    });

		$scope.signOut = function() {
			console.log('logging out');
			Auth.$signOut();
		};

		/* Data */
		var usersRef = baseRef.child('users');
		var whiteboardRef = baseRef.child('whiteboard');
		var chirpsRef = baseRef.child('chirps');

		// Create a firebaseObject of your users, and store this as part of $scope
		$scope.users = $firebaseObject(usersRef);		

		//binding: whiteboard
		$scope.whiteBoard = {};
		$scope.whiteBoard.text = "Enter text here!";
		var whiteBoardObj = $firebaseObject(whiteboardRef);
		whiteBoardObj.$bindTo($scope, "whiteboard")

		//chirps
		// Create a firebaseArray of your tweets, and store this as part of $scope
		$scope.chirps = $firebaseArray(chirpsRef);

		$scope.newChirp = {};
		$scope.postChirp = function() {
			var newChirp = {
				text:$scope.newChirp.text, 
				userId:$scope.userId, 
				likes:0, 
				time:firebase.database.ServerValue.TIMESTAMP //MAGIC!
			};
			console.log(newChirp);
			$scope.chirps.$add(newChirp).then(function() {
				$scope.newChirp.text = ''; //once chirp is saved
			});
		};

		// Function to like a tweet
		$scope.like = function(chirp) {
			if($scope.userId) {
				chirp.likes += 1;
				$scope.chirps.$save(chirp);
			}
		};
}]);