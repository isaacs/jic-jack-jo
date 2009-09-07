#!/usr/bin/env narwhal

// NB: Must create the database by going to
// http://localhost:5948/_utils

var couch = require("./lib/couch").CouchDB("http://localhost:5984/jic-jack-jo"),
    delres = couch.DELETE("_design/fooble"),
    result = couch.PUT("_design/jic-jack-jo", {
        language: "javascript",
        views : {
            next_game_id : {
                map : function (doc) {
                    emit( null, doc._id );
                },
                reduce : function (keys, vals) {
                    var max = parseInt(vals.pop().replace(/^game-/, ''), 10) + 1;
                    vals.forEach(function (each) {
                        each = parseInt(each.replace(/^game-/, ''), 10);
                        if (each >= max) max = each + 1;
                    });
                    return "game-"+max;
                }
            },
            another_thing : {
                map : function (doc) {
                    emit( null, doc );
                }
            }
        }
    });


if (result.status < 200 || result.status >= 300) {
    print("oh no!\n");
    require("http-client").HTTPClient.print(result);
    require("os").exit(1);
}

system.args.shift();
for (
    var arg = system.args.shift();
    arg;
    arg = system.args.shift()
) switch (arg) {
    case "test": {
        print("filling with test data");
        [
            {
                state : [
                    ["x", "x", "x"],
            		["o", "o", "x"],
            		["x", "o", "o"]
            	],
            	winner : "x",
            	history : [
            		{"x":[0,0]},
            		{"o":[1,0]},
            		{"x":[1,2]},
            		{"o":[1,1]},
            		{"x":[2,0]},
            		{"o":[2,2]},
            		{"x":[0,1]},
            		{"o":[2,1]},
            		{"x":[0,2]}
            	],
            	turn : null
            },
            {
                state : [
                    ["x", "x", ""],
            		["o", "o", "x"],
            		["", "x", "o"]
            	],
            	winner : null,
            	history : [
            		{"x":[0,0]},
            		{"o":[1,0]},
            		{"x":[1,2]},
            		{"o":[1,1]},
            		{"x":[2,1]},
            		{"o":[2,2]},
            		{"x":[0,1]},
            	],
            	turn : "o"
            },
            {
                state : [
                    ["x", "", ""],
            		["o", "o", "x"],
            		["", "", ""]
            	],
            	winner : null,
            	history : [
            		{"x":[0,0]},
            		{"o":[1,0]},
            		{"x":[1,2]},
            		{"o":[1,1]},
            	],
            	turn : "x"
            }
        ].forEach(function (game, index) {
            couch.PUT("/game-"+index, game);
        });
        
        break;
    }
    default : {
        print("Unknown argument: "+arg);
        break;
    }
}
system.stderr.write("ok");
system.stderr.flush();