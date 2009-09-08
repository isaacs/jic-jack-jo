#!/bin/bash

game="$1"
p="$2"
move="$3"

if [ "$game" == "" ] || [ "$move" == "" ] || [ "$p" == "" ]; then
	echo "Usage: ./move.sh <game> <player> <move>" > /dev/stderr
	exit 1
fi

cookiejar="player-$p.cookies.txt"
touch "$cookiejar"

echo "--"
echo "-- making move: $move"
echo "--"
curl -b "$cookiejar" -c "$cookiejar" -d "$move" http://localhost:8080/game/move/$game
echo ""
