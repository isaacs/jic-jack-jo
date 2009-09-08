// url mapping for move actions.

var Jack = require("jack"),
    HashP = require("hashp").HashP,
    Board = require("../tic-tac-toe/board").Board,
    couch = require("./couch").CouchDB("http://localhost:5984/jic-jack-jo"),
    map = {};

exports.app = require("./allowed-methods").AllowedMethods("POST", function (env) {
    // load the game state into a board.
    // check if the move is valid.
    // return the new game state, or an error
    
    var move = JSON.parse(env["jack.request.form_vars"]),
        game_id = env["PATH_INFO"].replace(/^.*?(game-[0-9]+).*$/g, '$1'),
        game = couch.GET(game_id);
    
    // make sure game exists.
    if (!game) return {
        status : 404,
        headers : {"Content-type" : "application/json"},
        body : [JSON.stringify({error : "Not Found: "+game_id})]
    };
    
    // make sure that the user is in this game, and authorized to make this move.
    var xo = ("x" in move) ? "x" : "o";
    if (game[xo] !== env["jjj.user"]) return {
        status : 403,
        headers : {"Content-type" : "application/json"},
        body : [JSON.stringify({error : "Forbidden"})]
    };
    
    var b = Board(game),
        valid = b.move(move);
    
    if (!valid) return {
        status : 400,
        headers : {"Content-type" : "application/json"},
        body : [JSON.stringify({
            "error" : "Invalid Move",
            "move" : move,
            "game" : game
        })]
    };
    
    // update game state.
    //TODO: It would be better to have Board just take a game object,
    // and update these things byref directly on the object.
    HashP.update(game, {
        win : b.getWinner(),
        turn : b.getTurn(),
        state : b.getState(),
        history : b.getHistory(),
        turn : b.getHistory().length === 9 ? null : xo === "x" ? "o" : "x"
    });
    
    // save to couchdb.
    couch.PUT(game._id, game);
    
    return {
        status : 200,
        headers : {"Content-Type":"application/json"},
        body : [JSON.stringify(game)]
    };
});

