//Import required modules
const https = require('https');
const fs = require('fs');
var sox = require('sox');
var express = require('express')
var md5 = require('md5');
var moment = require('moment');

var today = moment().format();

// Initialize the listener!
var app = express()
var port = 3000;

app.listen(port, function () {
  console.log('Listening on port '+port)
})

//Setup SAPI4 variables
var voice = "Sam";
var pitch = "100";
var speed = "150";

// Download the TTS from SAPI4
function download(url, dest, callback) {
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
        console.log("uWu I did a fucky.");
        console.error(err);
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
