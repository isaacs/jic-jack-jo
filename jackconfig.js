var Jack = require("jack"), map = {}, App, HashP = require("hashp").HashP;


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
HashP.update(map, require("./lib/urlmap"));
App = Jack.URLMap(map);

// require identity
App = (function (app) {
    return function (env) {
        var Request = Jack.Request;
        var cookie = new Jack.Request(env).cookies();
        if ("jjj.user" in cookie) {
            env["jjj.user"] = cookie["jjj.user"];
            return app(env);
        }
        // set the cookie.
        env["jjj.user"] = require("sha256").hash(
            require("os").command("echo $RANDOM")
        ).toString(64);
        result = app(env);
        var resp = new Jack.Response(result.status, result.headers, result.body);
        resp.setCookie("jjj.user", {
            value : env["jjj.user"],
            path : "/"
        });
        return resp.finish();
    };
})(App);

// jsonp on anything!
App = Jack.JSONP(App);


// serve static stuff from the /static folder.
App = Jack.Static(App, { urls : ["/static", "/tic-tac-toe"] });

// support bodiless HEAD requests
App = Jack.Head(App);

// support method swapping
App = Jack.MethodOverride(App);


//*/

// attach the content-length header.
App = Jack.ContentLength(App);

// return it;
exports.app = App;
