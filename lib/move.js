// url mapping for move actions.

var Jack = require("jack"),
    HashP = require("hashp").HashP,
    Board = require("../tic-tac-toe/board").Board,
    map = {};

map["/"] = require("./allowed-methods").AllowedMethods(function (env) {
    var move = JSON.parse(env["jack.request.form_vars"]);
    var game = env["PATH_INFO"].replace(/^.*?(game-[0-9]+).*$/g, '$1');
    
    // load the game state into a board.
    // check if the move is valid.
    // return the new game state, or an error
    
    // move is something like {x:[0,1]} or {o:[2,2]}
    var xo = ("x" in move) ? "x" : "o",
        spot = move[xo];
    
    // var b = Board(game);
    
    return {
        status : 200,
        headers : {"Content-Type":"text/javascript"},
        body : [JSON.stringify({
            game : game,
            move : move
        })]
    };
}, ["POST", "PUT"]);

exports.app = Jack.URLMap(map);