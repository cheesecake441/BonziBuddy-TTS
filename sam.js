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
var mysql  = require('mysql');
const config = require('./config.json');
const SimpleNodeLogger = require('simple-node-logger'),
    opts = {
        logFilePath:'./bonziBuddy.log',
        timestampFormat:'DD-MM-YYY HH:mm:ss.SSS'
    },

log = SimpleNodeLogger.createSimpleLogger( opts );

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : config.username,
  password : config.password,
  database : 'bonziBuddy'
});

connection.on('connect', function(){
  log.info("*** Connected to mySQL database ***");
});

connection.on('end', function(){
  log.info("*** Disconnected from mySQL ***");
});

connection.connect();

// Setup some global variables
var today = moment().format();
var port = 3000;

// Initialize the listener!
var app = express()

app.listen(port, function () {
  log.info('Listening on port '+port)
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
    log.info("=== TTS REQUESTED IS: ["+message+"]===");
  
    var dateString = md5(today);
    var fileToBeDeleted = 'TTS/'+dateString+'.wav';

    var encryption = md5(message);
    var encryptedFilename = 'TTS/'+encryption+'.wav';

    // Trigger the downloading using above params
    download(SAPI4, fileToBeDeleted, function(err){
        if(err){
            log.info("*** Error downloading TTS ***");
            console.error(err);
        }else{
            log.info("*** Download complete ***");
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
        console.log("uWu I made a fucky "+job.statusCode);
        log.error(err);
    });
    job.on('end', function() {
        log.info("*** File has been transcoded ***");
        log.info("*** Sending to User ***");
        log.info(encryptedFilename);

        // Set filetype as WAV 
        res.setHeader('content-type', 'audio/wav');
        res.download(encryptedFilename);
        fs.unlinkSync(fileToBeDeleted); //delete unencoded file

        // Probably don't need this ¯\_(ツ)_/¯
        connection.query(`INSERT INTO bonziBuddy.SAPI4 (ttsMessage, voice, filename, timestamp) VALUES ('${message}', 'Sam', '${encryptedFilename}', '${today}')`, function(error, results, fields){
          if(error) {
            connection.statusCode = 418;
            console.log("uWu I made a fucky: "+connection.statusCode);
            log.error(error);
          }else{
            log.info("*** mySQL records inserted ***");
          }
        });

        connection.end();
        log.info("Done.");
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