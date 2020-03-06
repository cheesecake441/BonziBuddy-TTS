#!/bin/bash

error() {
	echo ${RED}"Error: $@"${RESET} >&2
}

setup_color() {
	# Only use colors if connected to a terminal
	if [ -t 1 ]; then
		RED=$(printf '\033[31m')
		GREEN=$(printf '\033[32m')
		YELLOW=$(printf '\033[33m')
		BLUE=$(printf '\033[34m')
		BOLD=$(printf '\033[1m')
		RESET=$(printf '\033[m')
	else
		RED=""
		GREEN=""
		YELLOW=""
		BLUE=""
		BOLD=""
		RESET=""
	fi
}

main(){

    setup_color

    echo "${YELLOW}Installing tts-generator...${RESET}"
    git clone https://github.com/Palmdog57/BonziBuddy-TTS.git bonzi && cd bonzi
    echo "${YELLOW}Setting up node modules...${RESET}"
    npm install
    echo "${YELLOW}Setting up node modules...${RESET}"
    sudo apt-get install sox -y
    echo "${YELLOW}Creating TTS directory...${RESET}"
    mkdir ./TTS
    echo "${YELLOW}Installed successfully...${RESET}"
    sleep 1
    echo "${YELLOW}Starting service in PM2...${RESET}"
    pm2 start app.js
}

main "$@"
