angular.module('mahvin')
	.service('DataService', function(
		$http, $q, $cordovaFileTransfer, $cordovaFile
	) {
		var LOCAL_STORAGE_KEY = 'mahvin.decks';
		var SERVER_URL = 'http://mahvin.mybluemix.net';

		// replace the method call here to be persisted to some sort of server
		// later when working on app
		return {
			getDecks: getDecks,
			getDeck: getDeck,
			createDeck: createDeck,
			getCard: getCard,
			shuffleDeckCards: shuffleDeckCards,
			textToSpeech: textToSpeech,
			learnMore: learnMore
		};

		function getDecks () {
			return localStorage.getItem(LOCAL_STORAGE_KEY) ?
				JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) :
				[];
		}

		function getDeck (id) {
			return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY))[id];
		}

		function createDeck (deck) {
			var decks = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) ||
				[];

			decks.push(deck);

			updateDecks(decks);
		}

		function getCard (deckId, questionId) {
			return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY))[deckId]
				.questions[questionId];
		}

		function shuffleDeckCards (deckId) {
			var decks = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));

			shuffle(decks[deckId].questions);

			updateDecks(decks);
		}

		function textToSpeech (text, filename) {
			var deferred = $q.defer();

			$http.post(SERVER_URL + '/textandspeech/speech', {
				text: text,
				filename: filename
			}).then(function(response) {
				console.log('Successfully created text to speech file');
				console.log('Now downloading sound file from server');

				console.log(response);

				var url = SERVER_URL + '/textandspeech/speech/' + filename;
				var targetPath = cordova.file.tempDirectory + filename + '.mp3';
				var trustHosts = true;
				var options = {};

				console.log('downloading speech file ' + url);

				$cordovaFileTransfer
					.download(url, targetPath, options, trustHosts)
					.then(function(result) {
						// Success!
						console.log('Successfully created the text to speech file ' + filename);
						deferred.resolve('Sound file created');
					}, function(err) {
						// Error
						alert(JSON.stringify(err));
					}, function (progress) {
						console.log(JSON.stringify(progress));
					});

			}, function(err) {
				deferred.reject('Fail to send request to text to speech');
				console.error(JSON.stringify(err));
			});

			return deferred.promise;
		}

		function learnMore (term) {
			return $http.get(SERVER_URL + '/conceptinsight/conceptinsight/' + term);
		}

		// private helpers functions
		function shuffle(o){
			for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
			return o;
		}

		function updateDecks (decks) {
			localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(decks));
		}
	});
