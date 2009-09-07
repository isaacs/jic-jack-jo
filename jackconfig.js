var Jack = require("jack"), map = {};


//*

// map the urls to functions as specified
// var map = {
//     "/game" : function (env) {
//         return [200, {"Content-type": "text/plain"}, ["would you like to play a game?"]];
//     }
// };

map["/test"] = function (env) {
    var req = new Jack.Request(env);
    
    var body = [
        "<!DOCTYPE html><head><title>test</title></head>",
        "<body>"
    ];
    
    
    body.push("<form action='' method=post><input name=foo value=bar type=submit></form>");
    
    body.push(req.POST("foo") || 'no foo!');
    body.push("<br>");
    
    body.push(JSON.stringify(req.POST()) || "huh?");
    
    body.push("<br>gets: <br>")
    body.push(JSON.stringify(req.GET()) || "huh?");
    // body.push("<hr>");
    // body.push(JSON.stringify(env["jack.request"]));
    
    
    body.push("<pre>");
    for (var i in env) {
        body.push(i+":"+typeof(env[i])+" "+env[i]+"\n");
    }
    body.push("</pre>");
    
    
    return new Jack.Response(200, {}, body).finish();

};

// map the requests to handlers
require("hashp").HashP.update(map, require("./lib/urlmap"));
exports.app = Jack.URLMap(map);

// jsonp on anything!
exports.app = Jack.JSONP(exports.app);


// serve static stuff from the /static folder.
exports.app = Jack.Static(exports.app, { urls : ["/static", "/tic-tac-toe"] });

// support bodiless HEAD requests
exports.app = Jack.Head(exports.app);

// support method swapping
exports.app = Jack.MethodOverride(exports.app);


//*/

// attach the content-length header.
exports.app = Jack.ContentLength(exports.app);
