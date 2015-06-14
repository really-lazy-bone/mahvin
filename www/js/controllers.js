angular.module('starter')
	.controller('ResponseCtrl', function($state) {
		var vm = this;

		vm.messageMap = {
			success: [
				"Finally, You Figured it Out!",
				"Took You Long Enough",
				"Great, We Can Move On"
			],
			error: [
				"Wrong! Did You Even Study?!",
				"Nope.",
				"Are We Gonna Be Here All Night?"
			],
			apiError: [
				"What Language Are You Speaking?!",
				"Repeat That. I Lost Interest",
				"What Are You Talking About?"
			]
		};

		// sanity check
		console.log('Hello Response');

		vm.goBack = goBack;

		init();

		function goBack () {
			$state.go('landing');
		}

		function init () {
			vm.success = true;

			vm.question = 'Define pedantic';

			var randomIndex = Math.floor(Math.random() * 3);

			if (vm.success) {
				vm.imageUrl = 'img/standing.png';
				vm.message = vm.messageMap.success[randomIndex];
			} else if (vm.error) {
				vm.imageUrl = 'img/double-point.png';
				vm.message = vm.messageMap.error[randomIndex];
			}
		}
	})
	.controller('LandingCtrl', function($state) {
		var vm = this;

		// sanity check
		console.log('Hello Landing');

		vm.goToMenu = goToMenu;

		function goToMenu () {
			$state.go('menu');
		}
	})
	.controller('MenuCtrl', function($state) {
		var vm = this;

		// sanity check
		console.log('Hello Menu');

		vm.goBack = goBack;
		vm.goToCreate = goToCreate;

		function goBack () {
			$state.go('landing');
		}

		function goToCreate () {
			$state.go('input');
		}
	})
	.controller('InputCtrl', function(
		$cordovaCapture,
		$cordovaMedia,
		$ionicPlatform,
		$cordovaFile,
		$cordovaFileTransfer,
		$timeout
	) {
		var vm = this;

		// sanity check
		console.log('Hello Input');

		vm.speech = speech;
		vm.takePicture = takePicture;
		vm.testSound = testSound;

		function testSound () {
			document.addEventListener('deviceready', function() {
				var media = $cordovaMedia.newMedia(
					'cdvfile://localhost/temporary/converted.mp3'
				);

				media.then(function() {
					console.log('Got file');
				}, function(err) {
					console.error('error getting media file');
					console.error(JSON.stringify(err));
				});

				// success
				// sanity check
				console.log('Playing audio ' + JSON.stringify(media));
				media.play();

				// var url = "http://muses.mybluemix.net/textandspeech/getspeech";
				// var targetPath = cordova.file.tempDirectory + "testSound.ogg";
				// var trustHosts = true;
				// var options = {};

				// console.log('downloading speech file ' + url);

				// $cordovaFileTransfer
				// 	.download(url, targetPath, options, trustHosts)
				// 	.then(function(result) {
				// 		// Success!
				// 		document.addEventListener("deviceready", function () {
				// 			var media = $cordovaMedia.newMedia(
				// 				result.toInternalURL()
				// 			);

				// 			media.then(function() {
				// 				console.log('Got file');
				// 			}, function(err) {
				// 				console.error('error getting media file');
				// 				console.error(JSON.stringify(err));
				// 			});

				// 			// success
				// 			// sanity check
				// 			console.log('Playing audio ' + JSON.stringify(media));
				// 			media.play();
				// 		}, false);
				// 	}, function(err) {
				// 		// Error
				// 		alert(JSON.stringify(err));
				// 	}, function (progress) {
				// 		console.log(progress);
				// 		$timeout(function () {
				// 			console.log((progress.loaded / progress.total) * 100);
				// 		});
				// 	});
			}, false);
		}

		function speech (event) {
			event.stopPropagation();

			// sanity check
			console.log('start recording');

			var options = {
				limit: 3,
				duration: 10
			};

			document.addEventListener("deviceready", function () {
				$cordovaCapture.captureAudio(options)
					.then(function(audioData) {
						// testing 1 second delay to play audio
						console.log('Got Audio');
						console.log(JSON.stringify(audioData));

						// {
						// 	'localURL': '.wav' // android for .amr
						// }

						document.addEventListener("deviceready", function () {
							var media = $cordovaMedia.newMedia(
								audioData[0].localURL
							);

							media.then(function() {
								console.log('Got Recorded File');
							}, function(err) {

							});

							// success
							// sanity check
							console.log('Playing audio' + JSON.stringify(media));
							media.play();
						}, false);

					}, function(err) {
						alert(JSON.stringify(err));
					});
			}, false);
		}

		function takePicture (event) {
			event.stopPropagation();

			// sanity check
			console.log('Start taking picture');

			var options = { limit: 1 };

			document.addEventListener("deviceready", function () {
				$cordovaCapture.captureImage(options)
					.then(function(imageData) {
						// Success! Image data is here
						console.log(JSON.stringify(imageData));
					}, function(err) {
						// An error occurred. Show a message to the user
						alert(JSON.stringify(err));
					});
			}, false);
		}
	});
