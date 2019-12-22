//Import required modules
const https = require('https');
const fs = require('fs');
var sox = require('sox');
var express = require('express')
var md5 = require('md5');
var moment = require('moment');
var mysql  = require('mysql');
const config = require('./config.json');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : config.username,
  password : config.password,
  database : 'bonziBuddy'
});


connection.on('connect', function(){
  console.log("*** Connected to mySQL ***");
});

connection.connect();

// Setup globals
var today = moment().format();
const port = 6969;

// Initialize the listener!
var app = express()

app.listen(port, function () {
  console.log('Listening on port '+port)
})

//Setup SAPI4 variables
var voice = "Adult%20Male%20%232%2C%20American%20English%20(TruVoice)";
var pitch = "140";
var speed = "157";

// Download the TTS from SAPI4
function download(url, dest, callback) {
  console.log("*** Received TTS ***");
  var file = fs.createWriteStream(dest);
  var request = https.get(url, async function(response) {
    response.pipe(file);
    file.on('finish', function () {
      file.close(callback); // close() is async, call callback after close completes.
    });
    file.on('error', function (err) {
      fs.unlink(dest); // Delete the file async.
      if (callback)
        callback(err.message);
    });
  });
}

// Triggered when the user sets params
app.get('/play', function (req, res) {
    var message = req.query.text;
    var SAPI4 = "https://tetyys.com/SAPI4/SAPI4?text=" + message + "&voice=" + voice + "&pitch=" + pitch + "&speed=" + speed;
    
    var dateString = md5(today);
    var fileToBeDeleted = 'TTS/'+dateString+'.wav';

    var encryption = md5(message);
    var encryptedFilename = 'TTS/'+encryption+'.wav';

    // Trigger the downloading using above params
    download(SAPI4, fileToBeDeleted, function(err){
        if(err){
            console.log("*** Error downloading TTS ***");
            console.error(err);
        }else{
            console.log("*** Download complete ***");
            job.start();
        }
    });

    // Make the audio usable by asterisk
    var job = sox.transcode(fileToBeDeleted, encryptedFilename, {
        sampleRate: 8000,
        format: 'wav',
        channelCount: 1,
        bitRate: 192 * 1024,
        compressionQuality: 5,
    });
    job.on('error', function(err) {
      job.statusCode = 500;  
      console.log("uWu I did a fucky "+job.statusCode);
    });
    job.on('end', function() {
        console.log("\n*** File has been transcoded ***");
        console.log("*** Sending to User ***");
        res.setHeader('content-type', 'audio/wav');
        res.download(encryptedFilename);
        fs.unlinkSync(fileToBeDeleted)
        console.log("Done.");
    });

});
