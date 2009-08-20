# sketching jic-jack-jo

The server consists of a game engine that exposes RESTful ws entry points to its functionality.

## Notation

The game state is expressed as a 2d array of numbers, containing "x" for X, "o" for O, or "" for an empty spot.

For example:

	[
		["x", "x", ""],
		["o", "o", "x"],
		["x", "o", "o"]
	]

A move is expressed as an object with one member, keyed as either an "x" or an "o", and a set of coordinates indicating the location on the board.  For instance,

	{"x" : [0,2]}

would mean "place an 'x' at game[0][2]".  If applied to the previous example, this would result in:

	[
		["x", "x", "x"],
		["o", "o", "x"],
		["x", "o", "o"]
	]

resulting in a win for X.

A series of moves can be expressed as an ordered array of move objects.  For instance, to express the whole game above, this might be the history:

	[
		{"x":[0,0]},
		{"o":[1,0]},
		{"x":[1,2]},
		{"o":[1,1]},
		{"x":[2,1]},
		{"o":[2,2]},
		{"x":[0,1]},
		{"o":[2,1]},
		{"x":[0,2]}
	]

A game in progress is expressed as an object with userids assigned to the x and o members.  If a seat is available, it is set as "null".  The "visible" member specifies whether non-players can watch the game, as well as whether it shows in the game list.  (Invisible games can be joined as a player, but require some sort of an invitation.)

	{
		"id" : {gameid},
		"x" : {userid|null},
		"o" : {userid|null},
		"visible" : {true|false},
		"state" : {GAME_STATE},
		"turn" : {"x"|"o"},
		"win" : {"x"|"o"|null}
	}

@TODO: Perhaps there should be separate flags for "invite-only" and "visible"?

## Requests

For all GETs, client may pass an If-Unmodified-Since header, and the server may respond with a 304 if appropriate.  All cacheable server responses should contain a Last-Modified header to facilitate this.

Examples show request bodies in JSON, but query-string encoding is also acceptable.

If the HTTP-Accept header contains text/html, then pass the data through the template engine.  If the HTTP-Accept header contains application/json, then return a json representation of the appropriate data.



### POST /identify

	{
		"user" : 987,
		"password" : "foobaltz"
	}

User and password can go in the http auth headers, but they could also go in the request body as shown.

If the login fails, the response is a 401 Unauthorized response, and it's up to the consumer to try again.  (In a browser, this triggers the request for username and password, and the request is resubmitted with the proper http auth headers.)

On a successful identify, return a Set-Cookie header with a session token.

### POST /identify/{path}

Just like the regular /identify request, however the additional path information is used to redirect the user using a 302 Found if the login succeeds.

### GET /games

return a list of available games, and who is playing in them.  Format is an array of game objects.

### GET /game/{id}

return the game info object for just one game, specified by id, with the game state description.

If the game is not visible, and has started, then return a 403 Forbidden.

If the HTTP-Accept includes "application/json+comet", and an If-Modified-Since, then keep the connection open as long as possible, until the game has a new change since that time.  At that point, return the new game state and close the connection immediately.

@TODO: is an HTTP header really the best way to provide comet functionality?  What if we want to do jsonp?  Maybe this should be a query param or something.

### GET /game/{id}/moves

return the array of moves made to date in the game, specified by id.

Invisible games can only be seen by players.

### POST /game/{id}/join

	{ "x" : 987 }

Join the game.  Authentication required.  If authentication is not provided, then user is redirected to /identify/game/{id} to provide credentials.

If the seat is taken, then return a 400 Bad Request, with the current game state as the request body, so that the client can try again.

### POST /game/{id}/move

If the user is not allowed to make the supplied move, then return a 403.

Otherwise, return an updated game state.
