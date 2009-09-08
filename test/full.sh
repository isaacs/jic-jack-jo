#!/bin/bash

xgame=$( ( ./join.sh x | grep joined: | egrep -o 'game-[0-9]+' ) 2>/dev/null )
ogame=$( ( ./join.sh o | grep joined: | egrep -o 'game-[0-9]+' ) 2>/dev/null )

if [ "$xgame" != "$ogame" ]; then
	echo "Fail. The games don't match. Clear the db and try again, perhaps." >/dev/stderr
	exit 1
fi
game="$xgame"
# Now they're both playing at $game.

./move.sh "$game" x '{"x":[0,0]}' # upper left.
./move.sh "$game" o '{"o":[0,1]}' # upper center.
./move.sh "$game" x '{"x":[0,2]}' # upper right.
./move.sh "$game" o '{"o":[2,1]}' # bottom center. bad move!
./move.sh "$game" x '{"x":[1,1]}' # center. victory is certain.
./move.sh "$game" o '{"o":[2,0]}' # bottom left. too little too late.
./move.sh "$game" x '{"x":[2,2]}' # bottom right. Victory!
