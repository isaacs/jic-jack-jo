#!/bin/bash

game="$1"
p="$2"

if [ "$game" == "" ]; then
	echo "Usage: ./state.sh <game>" > /dev/stderr
	exit 1
fi

cookiecurl=""
if [ "$p" != "" ]; then
	cookiejar="player-$p.cookies.txt"
	touch "$cookiejar"
	cookiecurl="-c $cookiejar -b $cookiejar"
fi

gameurl="http://localhost:8080/game/$game"

curl $cookiecurl "$gameurl"
