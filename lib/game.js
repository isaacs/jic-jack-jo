// the url map for game-related actions.

var Jack = require("jack"), HashP = require("hashp").HashP;

var map = {};

var couch = require("./couch").CouchDB("http://localhost:5984/jic-jack-jo");

var emptyGame = {
    x : null,
    o : null,
    state : [["","",""],["","",""],["","","x"]],
    turn : "x",
    win : null
};

function sitDown (user) {
    // see if there is an empty seat.
    var seat = couch.GET("_design/jic-jack-jo/_view/open_seat").rows[0].value;
    var game;
    if (seat[0] === "open") {
        game = couch.GET(seat[1]);
        // make sure i'm not sitting there already...
        if (game) {
            if (game.x !== user && game.o !== user) {
                // sit down
                game[ seat[2] ] = user;
                if (couch.PUT(seat[1], game, true).status !== 201) return sitDown(user);
                return game;
            }
            // already sitting.
            return game;
        }
    }
    // either the seats are all full, or the GET failed.
    game = emptyGame;
    game.x = user;
    game._id = seat[1];
    if (!couch.PUT(seat[1], game, true)) return sitDown(user);
    return game;
}
map["/new"] = require("./allowed-methods").AllowedMethods(function (env) {
    var game = sitDown(env["jjj.user"]);
    return {
        status : 302,
        headers : {"Content-Type":"text/plain","Location":"http://"+env.HTTP_HOST+"/game/"+game._id},
        body : []
    };
}, ["POST", "PUT"]);

map["/move"] = require("./move").app;

map["/"] = function (env) {
    
    var id = env.PATH_INFO.replace(/^.*?(game-[0-9]+).*$/g, '$1');
    var game = couch.GET(id);
    if (!game) return {
        status : 302,
        headers : {Location:"http://"+env.HTTP_HOST+"/game/new"},
        body : []
    }
    game.you = env["jjj.user"];
    
    return {
        status :200,
        headers : {"Content-Type":"text/javascript"},
        body : [JSON.stringify(game)]
    };
};

exports.app = Jack.URLMap(map);