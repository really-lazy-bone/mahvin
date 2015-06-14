var express = require('express');
var router = express.Router();
var path = require('path');
var iod = require('iod-node');
var config = require('../config');
var fs = require('fs');
var client = new iod.IODClient('http://api.idolondemand.com', config.imagetotext.key);



router.post('/text', function (req, res) {


  if (req.files) {
    fs.exists(req.files.file.path, function (exists) {
      if (exists) {

        var callback = function (err, resp, body) {
          res.send(JSON.stringify(body.text_block[0].text));
        };


        var data = { 'file': req.files.file.path };
        client.call('ocrdocument', data, callback);



      } else {
        res.end("failed");
      }
    });
  }

});

router.get('/textdemo', function (req, res) {
  var callback = function (err, resp, body) {
    console.log(body.text_block[0].text);
  };


  var data = { 'file': './uploads/indexCardTest2.png' };
  client.call('ocrdocument', data, callback);
});

module.exports = router;
