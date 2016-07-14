'use strict';

var app = angular.module('ChirperApp', ["firebase"]);

app.controller('ChirperCtrl', ['$scope', "$firebaseAuth", "$firebaseObject", "$firebaseArray", function($scope, $firebaseAuth, $firebaseObject, $firebaseArray) {

	var Auth = $firebaseAuth();

	Auth.$onAuthStateChanged(function(firebaseUser) {
		if (firebaseUser) {
			$scope.userId = firebaseUser.uid;
		} else {
			$scope.userId = undefined;
		}
	});

	$scope.newUser = {};
	//get reference to the "root" of the database: the containing JSON
	var baseRef = firebase.database().ref();
	var usersRef = baseRef.child('users'); //refers to "users" value
	$scope.users = $firebaseObject(usersRef);
	$scope.signUp = function() {
		Auth.$createUserWithEmailAndPassword($scope.newUser.email, $scope.newUser.password)
		.then(function(firebaseUser) {
			$scope.userId = firebaseUser.uid;
			var userData = {handle: $scope.newUser.handle, avatar: $scope.newUser.avatar};
			var newUserRef = usersRef.child(firebaseUser.uid);
			newUserRef.set(userData); //set the key's value to be the object you created
			//assign the "users" value to $scope.users
			$scope.users = $firebaseObject(usersRef);
		})
		.catch(function(e) {
			console.log(e);
		});
	};

	$scope.signOut = function() {
    	Auth.$signOut(); //AngularFire method
	};

	//respond to "Sign In" button
	$scope.signIn = function() {
		Auth.$signInWithEmailAndPassword($scope.newUser.email, $scope.newUser.password); //AngularFire method
	};

	$scope.chirppad = {};
	var padRef = baseRef.child("chirppad");
	var chirppadObj = $firebaseObject(padRef);
	chirppadObj.$bindTo($scope, "chirppad");

	var chirpsRef = baseRef.child("chirps");
	$scope.chirps = $firebaseArray(chirpsRef);

	$scope.newChirp = {};
	$scope.postChirp = function() {

		var chirpData = {
		    text: $scope.newChirp.text,
		    userId: $scope.userId,
		    likes: 0,
		    time: firebase.database.ServerValue.TIMESTAMP        
		};

		$scope.chirps.$add(chirpData);
	};

	//Make a function called "like() which is called when the button is pressed
	//Note this function is passed in the chirp itself

   //Change a property (likes) of that chirp appropriately

   //Call .$save() on your chirps array, passing in
   //which chirp needs to be updated

   $scope.like = function(tweet) {

   		tweet.likes = tweet.likes + 1;
   		$scope.chirps.$save(tweet);

   };




}]);