angular.module('mahvin')
	.controller('QuizCtrl', function($state, $stateParams, DataService, $cordovaFileTransfer, $cordovaMedia, $cordovaFile, $ionicLoading) {
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

		textToSpeech();

		update();

		vm.goBack = goBack;
		vm.guess = guess;
		vm.retry = retry;
		vm.toPreviousQuestion = toPreviousQuestion;
		vm.toNextQuestion = toNextQuestion;
		vm.learnMore = learnMore;
		vm.done = done;

		function textToSpeech () {
			document.addEventListener('deviceready', function() {
				$cordovaFile.checkFile(
					cordova.file.tempDirectory,
					vm.deck.name + '-' + vm.currentQuestionId + '.mp3'
				).then(function(result) {
					console.log(JSON.stringify(result));

					var media = $cordovaMedia.newMedia(
						result.toInternalURL()
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
				}, function() {
					var url = "http://mahvin.mybluemix.net/textandspeech/speech?filename=" + vm.deck.name;
					var targetPath = vm.deck.name + '-' + vm.currentQuestionId + '.mp3';
					var trustHosts = true;
					var options = {};

					console.log('downloading speech file ' + url);

					$cordovaFileTransfer
						.download(url, targetPath, options, trustHosts)
						.then(function(result) {
							// Success!
							var media = $cordovaMedia.newMedia(
								result.toInternalURL()
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
						}, function(err) {
							// Error
							console.error(JSON.stringify(err));
						}, function (progress) {
							console.log(progress);
						});
				});
			}, false);
		}

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

			vm.answer = '';

			textToSpeech();

			retry();
		}

		function toNextQuestion () {
			vm.currentQuestionId ++;
			vm.question = vm.deck.questions[vm.currentQuestionId];

			vm.answer = '';

			textToSpeech();

			retry();
		}

		function learnMore () {
			vm.mode = 'learnmore';
			vm.message = '';

			$ionicLoading.show({
				template: '<ion-spinner icon="lines"></ion-spinner><br>Finding info...',
				delay: 100
			});

			DataService.learnMore(vm.question.question)
				.then(function(response) {
					vm.insight = response.data;

					$ionicLoading.hide();
				}, function(err) {
					console.error(JSON.stringify(err));
				});
		}

		function done () {
			$state.go('menu');
		}

		function update () {
			var randomIndex = Math.floor(Math.random() * 3);

			if (vm.mode === 'success') {
				vm.imageUrl = 'img/standing.png';
				vm.message = vm.messageMap.success[randomIndex];
				$cordovaMedia.newMedia('sound/success' + randomIndex + '.mp3')
					.play();
			} else if (vm.mode === 'error') {
				vm.imageUrl = 'img/double-point.png';
				vm.message = vm.messageMap.error[randomIndex];
				$cordovaMedia.newMedia('sound/error' + randomIndex + '.mp3')
					.play();
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
		$ionicLoading,
		$cordovaImagePicker,
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
			console.log('Calling text to speech function');
			textToSpeech();

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

			if (vm.deck.questions[vm.currentQuestionId]) {
				vm.question = vm.deck.questions[vm.currentQuestionId].question;
				vm.answer = vm.deck.questions[vm.currentQuestionId].answer;
			} else {
				vm.question = '';
				vm.answer = '';
			}
		}

		function textToSpeech () {
			console.log('handling text to speech');

			DataService.textToSpeech(
				vm.question,
				vm.deck.name + '-' + vm.currentQuestionId
			).then(function(response) {
				console.log('Sound file created');
			}, function(err) {
				// remove loading indicator
				console.error(JSON.stringify(err));
			});
		}

		function speech (event, type) {
			event.stopPropagation();

			// sanity check
			console.log('start recording');

			var options = {
				limit: 1,
				duration: 10
			};

			document.addEventListener("deviceready", function () {
				$cordovaCapture.captureAudio(options)
					.then(function(audioData) {
						// testing 1 second delay to play audio
						console.log('Got Recorded Audio');
						console.log(JSON.stringify(audioData));

						// {
						// 	'localURL': '.wav' // android for .amr
						// }

						$cordovaFileTransfer.upload('http://mahvin.mybluemix.net/textandspeech/text', audioData[0].localURL)
								.then(function(result) {
									// Success!
									console.log('Uploaded');

									console.log(JSON.stringify(result));

									if (type === 'question') {
										vm.question = result.response
											.split('"')
											.join('');
									} else if (type === 'answer') {
										vm.answer = result.response
											.split('"')
											.join('');
									}

								}, function(err) {
									// Error
									console.log(JSON.stringify(err));
								}, function (progress) {
									// constant progress updates
									console.log(JSON.stringify(progress));
								});

					}, function(err) {
						alert(JSON.stringify(err));
					});
			}, false);
		}

		function takePicture (event, type) {
			event.stopPropagation();

			// sanity check
			console.log('Start taking picture');

			var options = { limit: 1 };

			document.addEventListener("deviceready", function () {
				// $cordovaCapture.captureImage(options)
				// 	.then(function(imageData) {
				// 		// Success! Image data is here
				// 		console.log(JSON.stringify(imageData));
				// 	}, function(err) {
				// 		// An error occurred. Show a message to the user
				// 		alert(JSON.stringify(err));
				// 	});
				var options = {
					maximumImagesCount: 1,
					width: 800,
					height: 800,
					quality: 80
				};

				$cordovaImagePicker.getPictures(options)
					.then(function (results) {
						console.log('Getting image ' + results[0]);
						$ionicLoading.show({
							template: '<ion-spinner icon="lines"></ion-spinner><br>Converting...',
							delay: 100
						});

						$cordovaFileTransfer.upload('http://mahvin.mybluemix.net/textandimage/text', results[0])
								.then(function(result) {
									// Success!
									console.log('Uploaded');

									if (type === 'question') {
										vm.question = result.response
											.split('"')
											.join('');
									} else if (type === 'answer') {
										vm.answer = result.response
											.split('"')
											.join('');
									}

									$ionicLoading.hide();

								}, function(err) {
									// Error
									console.error(JSON.stringify(err));
								}, function (progress) {
									// constant progress updates
									console.log(progress);
								});

					}, function(error) {
						// error getting photos
					});
			}, false);
		}
	});
