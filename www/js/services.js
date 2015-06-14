angular.module('mahvin')
	.service('DataService', function() {
		var LOCAL_STORAGE_KEY = 'mahvin.decks';
		// replace the method call here to be persisted to some sort of server
		// later when working on app
		return {
			getDecks: getDecks,
			getDeck: getDeck,
			createDeck: createDeck,
			getCard: getCard,
			shuffleDeckCards: shuffleDeckCards,
			textToSpeech: textToSpeech
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

		function textToSpeech () {

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
