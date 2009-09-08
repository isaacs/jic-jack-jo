// the url map for game-related actions.

var Jack = require("jack"),
    HashP = require("hashp").HashP,
    map = {},
    couch = require("./couch").CouchDB("http://localhost:5984/jic-jack-jo"),
    emptyGame = {
        x : null,
        o : null,
        state : [["","",""],["","",""],["","",""]],
        turn : "x",
        win : null
    };

function gameURL (env, game_id) {
    return env["jsgi.url_scheme"]+"://"+env.HTTP_HOST+"/game/"+game_id;
};

function sitDown (user) {
    // see if there is an empty seat.
    var seat = (
        couch.GET("_design/jic-jack-jo/_view/open_seat").rows[0] ||
        {value:{id:"game-0", state:"new"}}
    ).value;
    
    var game;
    if (seat.state === "open") {
        game = couch.GET(seat.id);
        // make sure i'm not sitting there already...
        if (game) {
            if (game.x !== user && game.o !== user) {
                // sit down
                game[ seat.seat ] = user;
                if (couch.PUT(seat.id, game, true).status !== 201) return sitDown(user);
                return game;
            }
            // already sitting.
            return game;
        }
    }
    // either the seats are all full, or the GET failed.
    game = emptyGame;
    game.x = user;
    game._id = seat.id;
    if (!couch.PUT(seat.id, game, true)) return sitDown(user);
    return game;
};
map["/join"] = require("./allowed-methods").AllowedMethods(
    "POST", "PUT", "HEAD", "GET",
    function (env) {
        var game = sitDown(env["jjj.user"]),
            location = gameURL(env, game._id);
        return {
            status : 302,
            headers : {
                "Content-Type":"text/plain",
                "Location":location
            },
            body : [JSON.stringify({"error":"Found", "location":location})]
        };
    }
);

map["/move"] = require("./move").app;

map["/"] = function (env) {
    
    var id = env.PATH_INFO.replace(/^.*?(game-[0-9]+).*$/g, '$1'),
        game = couch.GET(id);
    
    if (!game) return {
        status : 404,
        headers : {"Content-Type":"application/json"},
        body : [JSON.stringify({error:"not_found"})]
    }
    
    // make sure that it's a proper url.
    var cannonical = "/" + game._id,
        location = gameURL(env, game._id);
    if (env.PATH_INFO !== cannonical) return {
        status : 301,
        headers : {
            "Content-Type":"application/json",
            "Location" : location
        },
        body : [JSON.stringify({"error":"Moved Permanently","location":location})]
    };
    
    game.user = {
        id : env["jjj.user"],
        seat : (
            game.x === env["jjj.user"] ? "x"
            : game.o === env["jjj.user"] ? "o"
            : null
        )
    };
    
    return {
        status :200,
        headers : {"Content-Type":"application/json"},
        body : [JSON.stringify(game)]
    };
};

exports.app = Jack.URLMap(map);