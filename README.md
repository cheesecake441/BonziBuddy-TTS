<p align="center"><img src="https://i.ibb.co/Tg2CwGh/bonzi-Buddy.png" width="400"></p>

# SAPI 4 TTS Generator
>If you don't program memes - do you even really write code?

## Usage
1. Import the mySQL DB with the included file:

   `$ mysql -e "CREATE DATABASE bonziBuddy"`<br>
   `$ mysql bonziBuddy < bonzi.sql`

1. Run `npm init` to install dependancies

1. Install sox<br> `apt install sox -y`

1. Start the listener and make a note of the port number
1. Generate TTS    
   A) using URL params in the browser<br>
   `localhost:6969/play?text=Hello%20my%20name%20is%20bonzi`
   
   B) Curling the requesting in the terminal<br>
   `curl -G --data-urlencode "text=Hello I am Bonzi" localhost:6969/play > /tmp/bonzi.wav`

1. Listen to the TTS 🤷

## Requirements
* PM2 
* Sox
* Request
* Request-Promise
* Simple-node-logger
* UID-Generator
* NanoID
* mySQL 
* Moment
* Mongoose(?)

