angular.module('mahvin')
	.controller('QuizCtrl', function($state, $stateParams, DataService) {
		var vm = this;

		// sanity check
		console.log('Hello Quiz');

		// hard coded map for random response
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

		vm.deck = DataService.getDeck($stateParams.id);
		console.log('Getting deck for Quiz ' + JSON.stringify(vm.deck));

		vm.currentQuestionId = 0;
		vm.mode = 'prompt';
		vm.question = vm.deck.questions[vm.currentQuestionId];

		update();

		vm.goBack = goBack;
		vm.guess = guess;
		vm.retry = retry;
		vm.toPreviousQuestion = toPreviousQuestion;
		vm.toNextQuestion = toNextQuestion;
		vm.done = done;

		function goBack () {
			$state.go('landing');
		}

		function guess () {
			vm.mode = (
				vm.answer.toLowerCase() ===
				vm.deck.questions[vm.currentQuestionId].answer.toLowerCase()
			) ? 'success' : 'error';

			update();
		}

		function retry () {
			vm.mode = 'prompt';
			vm.message = null;

			update();
		}

		function toPreviousQuestion () {
			vm.currentQuestionId --;
			vm.question = vm.deck.questions[vm.currentQuestionId];

			retry();
		}

		function toNextQuestion () {
			vm.currentQuestionId ++;
			vm.question = vm.deck.questions[vm.currentQuestionId];

			retry();
		}

		function done () {
			$state.go('menu');
		}

		function update () {
			var randomIndex = Math.floor(Math.random() * 3);

			if (vm.mode === 'success') {
				vm.imageUrl = 'img/standing.png';
				vm.message = vm.messageMap.success[randomIndex];
			} else if (vm.mode === 'error') {
				vm.imageUrl = 'img/double-point.png';
				vm.message = vm.messageMap.error[randomIndex];
			} else if (vm.mode === 'prompt') {
				vm.imageUrl = 'img/single-point.png';
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
	.controller('MenuCtrl', function($state, DataService) {
		var vm = this;

		// sanity check
		console.log('Hello Menu');

		vm.decks = DataService.getDecks();

		console.log('Getting decks ' + JSON.stringify(vm.decks));

		vm.goBack = goBack;
		vm.goToCreate = goToCreate;
		vm.goToQuiz = goToQuiz;

		function goBack () {
			$state.go('landing');
		}

		function goToCreate () {
			$state.go('input');
		}

		function goToQuiz (id) {
			$state.go('quiz', {id: id});
		}
	})
	.controller('InputCtrl', function(
		$state,
		$cordovaCapture,
		$cordovaMedia,
		$ionicPlatform,
		$cordovaFile,
		$cordovaFileTransfer,
		$timeout,
		DataService
	) {
		var vm = this;

		// sanity check
		console.log('Hello Input');

		vm.addingDeck = true;
		vm.deck = {
			name: '',
			questions: []
		};
		vm.currentQuestionId = 0;

		vm.speech = speech;
		vm.takePicture = takePicture;
		vm.testSound = testSound;
		vm.addDeck = addDeck;
		vm.cancelAddingQuestion = cancelAddingQuestion;
		vm.cancelAddingDeck = cancelAddingDeck;
		vm.goToBackOfCard = goToBackOfCard;
		vm.goToFrontOfCard = goToFrontOfCard;
		vm.addQuestion = addQuestion;
		vm.done = done;
		vm.toPreviousQuestion = toPreviousQuestion;
		vm.toNextQuestion = toNextQuestion;

		function addDeck () {
			vm.addingDeck = false;
		}

		function cancelAddingQuestion () {
			vm.addingDeck = true;
		}

		function cancelAddingDeck () {
			$state.go('menu');
		}

		function goToBackOfCard () {
			vm.addingAnswer = true;
		}

		function goToFrontOfCard () {
			vm.addingAnswer = false;
			vm.ansewr = '';
		}

		function addQuestion () {
			if (vm.currentQuestionId === vm.deck.questions.length) {
				vm.deck.questions.push({
					question: vm.question,
					answer: vm.answer
				});

				vm.question = '';
				vm.answer = '';

				console.log('Adding new question ' + JSON.stringify(vm.deck));

				vm.addingAnswer = false;
				vm.currentQuestionId ++;
			} else {
				vm.deck.questions[vm.currentQuestionId] = {
					question: vm.question,
					answer: vm.answer
				};

				console.log('Updated question ' + JSON.stringify(vm.deck));

				vm.currentQuestionId ++;
				vm.addingAnswer = false;

				if (vm.currentQuestionId === vm.deck.questions.length) {
					vm.question = '';
					vm.answer = '';
				} else {
					vm.question = vm.deck.questions[vm.currentQuestionId].question;
					vm.answer = vm.deck.questions[vm.currentQuestionId].answer;
				}
			}
		}

		function done () {
			DataService.createDeck(vm.deck);

			$state.go('menu');
		}

		function toPreviousQuestion () {
			vm.currentQuestionId --;
			vm.question = vm.deck.questions[vm.currentQuestionId].question;
			vm.answer = vm.deck.questions[vm.currentQuestionId].answer;
		}

		function toNextQuestion () {
			vm.currentQuestionId ++;
			vm.question = vm.deck.questions[vm.currentQuestionId].question;
			vm.answer = vm.deck.questions[vm.currentQuestionId].answer;
		}

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
