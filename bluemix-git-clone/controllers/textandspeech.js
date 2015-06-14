var express = require('express');
var router = express.Router();
var path = require('path');
var config = require('../config');

var watson = require('watson-developer-cloud');
var fs = require('fs');
var lame = require('lame');
var wav = require('wav');

var text_to_speech = watson.text_to_speech({
  username: config.texttospeech.username,
  password: config.texttospeech.password,
  version: 'v1'
});


var speech_to_text = watson.speech_to_text({
  "username": config.speechtotext.username,
  "password": config.speechtotext.password,
  "version": 'v1'
});


var specialCharactersToWords = {

  "0": " zero ",
  "1": " one ",
  "2": " two ",
  "3": " three ",
  "4": " four ",
  "5": " five ",
  "6": " six ",
  "7": " seven ",
  "8": " eight ",
  "9": " nine ",
  "+": " plus ",
  "-": " minus ",
  "*": " multiply ",
  "%": " divide ",
  ")": " right parenthesis ",
  "(": " left parenthesis ",
  "=": " equals ",
};

function replaceSpecialCharactersWithEnglish(stringToCheck) {
  var stringToReturn = stringToCheck;


  for (var property in specialCharactersToWords) {

    if (specialCharactersToWords.hasOwnProperty(property)) {

      if (stringToReturn.indexOf(property) >= 0)
        //stringToReturn = stringToReturn.replaceAll(property, specialCharactersToWords[property]);
        stringToReturn = stringToReturn.split(property).join(specialCharactersToWords[property]);
    }


  }

  return stringToReturn;



}


router.post('/speech', function (req, res) {

  var speechData = req.body;
  console.log("generate speech mp3");
  console.log("text: " + speechData.text);
  console.log("filename: " + speechData.filename);
  var params = {
    text: replaceSpecialCharactersWithEnglish(speechData.text),
    voice: 'VoiceEnUsMichael', // Optional voice
    accept: 'audio/wav'
  };

  var outputFileName = speechData.filename;

  var reader = text_to_speech.synthesize(params);

  reader.pipe(fs.createWriteStream('./audio/' + outputFileName + '.wav'));
  reader.on('end', function () {


    var input = fs.createReadStream('./audio/' + outputFileName + '.wav');
    var output = fs.createWriteStream('./audio/' + outputFileName + '.mp3');
    // start reading the WAV file from the input
    var wavReader = new wav.Reader();

    // we have to wait for the "format" event before we can start encoding
    wavReader.on('format', onFormat);

    // and start transferring the data
    input.pipe(wavReader);

    function onFormat(format) {
      console.error('WAV format: %j', format);

      // encoding the wave file into an MP3 is as simple as calling pipe()
      var encoder = new lame.Encoder(format);
      wavReader.pipe(encoder).pipe(output);
      wavReader.on('end', function () {

        //res.sendFile(path.join(__dirname, '../audio', outputFileName + '.mp3'));
        // res.download('./audio/' + outputFileName + '.mp3', outputFileName + '.mp3');
        res.sendStatus(200);
      });
    }

  });
});


router.post('/text', function (req, res) {

  if (req.files) {
    fs.exists(req.files.file.path, function (exists) {
      if (exists) {
        var params = {
          // From file
          audio: fs.createReadStream(req.files.file.path),
          content_type: 'audio/l16; rate=44100'
        };

        speech_to_text.recognize(params, function (err, response) {
          console.log(JSON.stringify(response));
          if (err)
            console.log(err);
          else {
            if(!response.results.length)
            {
              
              res.send(JSON.stringify(""));
            }
            else{
              
               console.log(JSON.stringify(response.results[0].alternatives[0].transcript));
            res.send(JSON.stringify(response.results[0].alternatives[0].transcript));
            }
           

          }


        });


      } else {
        res.end("failed");
      }
    });
  }



});
router.get('/speech/:filename', function (req, res) {
  var filename = req.param("filename");
  console.log("get speech mp3");
  console.log("filename: " + filename);

  res.sendFile(path.join(__dirname, '../audio', filename + '.mp3'));


});
router.get('/getspeechdemo', function (req, res) {

  var params = {
    text: replaceSpecialCharactersWithEnglish('2+2*2=6'),
    voice: 'VoiceEnUsMichael', // Optional voice
    accept: 'audio/wav'
  };

  var reader = text_to_speech.synthesize(params);

  reader.pipe(fs.createWriteStream('./audio/converted.wav'));
  reader.on('end', function () {


    var input = fs.createReadStream('./audio/converted.wav');
    var output = fs.createWriteStream('./audio/converted.mp3');
    // start reading the WAV file from the input
    var wavReader = new wav.Reader();

    // we have to wait for the "format" event before we can start encoding
    wavReader.on('format', onFormat);

    // and start transferring the data
    input.pipe(wavReader);

    function onFormat(format) {
      console.error('WAV format: %j', format);

      // encoding the wave file into an MP3 is as simple as calling pipe()
      var encoder = new lame.Encoder(format);
      wavReader.pipe(encoder).pipe(output);
      wavReader.on('end', function () {

  
        //res.sendFile(path.join(__dirname, '../audio', 'converted.mp3'));
        res.download('./audio/converted.mp3', 'converted.mp3');


      });
    }

  });



});
module.exports = router;
