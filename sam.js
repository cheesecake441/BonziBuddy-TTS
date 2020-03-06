/**
  * Microsoft Sam TTS Generator
  * 1) Initialise script and start listener
  * 2) Connect to SAPI4 site and download requested message
  * 3) Transcode message to 8000hz
  * 4) Download and cleanup
  * 
  * @license GPL-3.0
  * @version 1.2
  * @author Thomas Stephen Palmer
**/

//Import required modules
const https = require('https');
const fs = require('fs');
var sox = require('sox');
var express = require('express')
var md5 = require('md5');
var moment = require('moment');

// Initialize the listener!
var port = 3000;
var app = express()

app.listen(port, function () {
  console.log(`=== Listening on port ${port} ===`)
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
      file.close(callback);
    });
    file.on('error', function (err) {
      fs.unlink(dest);
      if (callback)
        callback(err.message);
    });
  });
}

// Triggered when the user sets params
app.get('/play', function (req, res) {
    var message = req.query.text;
    console.log(`Generating TTS message {${message}}`);
    var SAPI4 = "https://tetyys.com/SAPI4/SAPI4?text=" + message + "&voice=" + voice + "&pitch=" + pitch + "&speed=" + speed;
  
    //Setup filename & locations
    var today = moment().format('MM-DD-YYYY HH:mm:ss');
    var dateString = md5(today);
    var fileToBeDeleted = 'TTS/'+dateString+'.wav';

    var encryption = md5(message);
    var encryptedFilename = 'TTS/'+encryption+'.wav';

    // Trigger the downloading using above params
    download(SAPI4, fileToBeDeleted, function(err){
        if(err){
            err.code = 001
            console.error(err.code + "uWu - I made a fucky");
            console.error(err);
        }else{
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
        job.code = 500;  
        console.error(job.code+" - uWu I made a fucky ");
        console.error(err);
    });
    job.on('end', function() {
        console.log("*** File has been transcoded ***");
        console.log("*** Sending to User ***");

        // Set filetype as WAV & Send
        res.setHeader('content-type', 'audio/wav');
        res.download(encryptedFilename);

        //Cleanup & Say Goodbye
        fs.unlinkSync(fileToBeDeleted);
        console.log("---DONE---");
    });

});

/**
 *  This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/