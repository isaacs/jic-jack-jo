#!/bin/bash
p="$1"
if [ "$p" == "" ]; then
	echo "Usage: ./join.sh <player>" > /dev/stderr
	exit 1
fi

cookiejar="player-$p.cookies.txt"
touch "$cookiejar"

echo "--"
echo "-- attempting to join/create a game for player $p"
echo "--"
gameurl=$(
	curl -i -c "$cookiejar" -b "$cookiejar" http://localhost:8080/game/join \
		| tee /dev/stderr \
		| egrep -i '^Location: ' \
		| egrep -o 'http://.*$'
)
echo ""
echo "joined: $gameurl"
echo ""

game=$( echo $gameurl | egrep -o 'game-[0-9]+' )

./state.sh "$p" "$game"
