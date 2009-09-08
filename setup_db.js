#!/usr/bin/env narwhal

// NB: Must create the database by going to
// http://localhost:5948/_utils

var couch = require("./lib/couch").CouchDB("http://localhost:5984/jic-jack-jo"),
    result = couch.PUT("_design/jic-jack-jo", {
        language: "javascript",
        views : {
            seats : {
                map : function (doc) {
                    // figure out if this game is full, or awaiting a seat
                    emit(null, !(doc.x  && doc.o)
                        ? {state:"open", id:doc._id, seat:(doc.o ? "x" : "o")}
                        : {state:"full", id:doc._id}
                    );
                }
            },
            open_seat : {
                map : function (doc) {
                    // figure out if this game is full, or awaiting a seat
                    emit(null, !(doc.x  && doc.o)
                        ? {state:"open", id:doc._id, seat:(doc.o ? "x" : "o")}
                        : {state:"full", id:doc._id}
                    );
                },
                // games can be "new", "open", or "full"
                reduce : function (keys, vals) {
                    var res = vals.pop();
                    var p = function (v) { return parseInt(v.id.replace(/^game-/, ''), 10) };
                    vals.forEach(function (val) {
                        if (
                            res.state === "full" &&
                            (val.state === "open" || p(val) > p(res))
                        ) return res = val;
                    });
                    // now res is either "open" or the result with the guaranteed greatest ID
                    // increment it if it's not the highest, so that 
                    if (res.state === "full") {
                        res.id = "game-"+(p(res) + 1);
                        res.state = "new";
                    }
                    return res;
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
            	win : "x",
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
            	turn : null,
            	x : "test-user-x",
            	o : "test-user-o"
            },
            {
                state : [
                    ["x", "x", ""],
            		["o", "o", "x"],
            		["", "x", "o"]
            	],
            	win : null,
            	history : [
            		{"x":[0,0]},
            		{"o":[1,0]},
            		{"x":[1,2]},
            		{"o":[1,1]},
            		{"x":[2,1]},
            		{"o":[2,2]},
            		{"x":[0,1]},
            	],
            	turn : "o",
            	x : "test-user-x",
            	o : "test-user-o"
            },
            {
                state : [
                    ["x", "", ""],
            		["o", "o", "x"],
            		["", "", ""]
            	],
            	win : null,
            	history : [
            		{"x":[0,0]},
            		{"o":[1,0]},
            		{"x":[1,2]},
            		{"o":[1,1]},
            	],
            	turn : "x",
            	x : "test-user-x",
            	o : "test-user-o"
            },
            {
                state : [['','',''],['','',''],['','','']],
                win : null,
                history : [],
                turn : "x",
                x : "test-user-x",
                o : null
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