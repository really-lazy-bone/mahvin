var express = require('express');
var router = express.Router();
var path = require('path');
var config = require('../config');

var watson = require('watson-developer-cloud');
var watsonWikiRoot = '/graph/wikipedia/en-20120601/';
var wikipediaEnglishRoot = 'https://en.wikipedia.org/wiki/';

var fs = require('fs');
var concept_insights = watson.concept_insights({
	"username": config.conceptinsight.username,
	"password": config.conceptinsight.password,
	"version": 'v1'
});


router.get('/conceptinsight/:term', function (req, res) {
	var term = req.param("term");
	var params = {
		user: 'wikipedia',
		graph: 'en-20120601',
		text: term
	};


	// Retrieve the concepts for input text
	concept_insights.annotateText(params, function (err, result) {
		if (err)
			console.log(err);
		else {
			console.log("\n*** Annotate Text ***\n");
			console.log(JSON.stringify(result, null, 2));

			var payload = {
				func: 'semanticSearch',
				ids: [
					result[0].concept
				],
				corpus: 'ibmresearcher',
				user: 'public',
				limit: 5
			};

			concept_insights.semanticSearch(payload, function (error, results) {
				if (error)
					console.log(error);
				else {
					console.log("\n*** Semantic Search ***\n");

					var abstract = results.concepts[0].abstract;

					var relatedConcepts = [];

					for (var i = 0; i < results.results.length; i++) {

						for (var j = 0; j < results.results[i].tags.length; j++) {
							relatedConcepts.push(
								{
									concept: results.results[i].tags[j].concept.replace(watsonWikiRoot, ''),
									wikipedia_link: wikipediaEnglishRoot + results.results[i].tags[j].concept.replace(watsonWikiRoot, ''),
									score: results.results[i].tags[j].score

								});
						}

					}

					relatedConcepts = getUniqueConcepts(relatedConcepts);
					relatedConcepts.sort(compare);


					console.log(JSON.stringify(relatedConcepts, null, 2));
					var abstractAndRelatedConcepts = {

						abstract: abstract,
						related_concepts: relatedConcepts


					};


					res.send(JSON.stringify(abstractAndRelatedConcepts, null, 2));
				}
			});



		}
	});



});

function getUniqueConcepts(a) {
    var seen = {};
    var out = [];
    var len = a.length;
    var j = 0;
    for (var i = 0; i < len; i++) {
		var item = a[i];
		if (seen[item.concept] !== 1) {
			seen[item.concept] = 1;
			out[j++] = item;
		}
    }
    return out;
}

function compare(a, b) {
	if (a.score > b.score)
		return -1;
	if (a.score < b.score)
		return 1;
	return 0;
}

module.exports = router;
