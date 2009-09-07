var Jack = require("jack"), map = {}, App, HashP = require("hashp").HashP;

map["/test"] = require("./lib/test").app;

// map the requests to handlers
HashP.update(map, require("./lib/urlmap"));
App = Jack.URLMap(map);

// require the jjj.user cookie/env
App = (function (app) {
    return function (env) {
        // if already set, then just bypass this middleware.
        if (env["jjj.user"]) return app(env);
        
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

// attach the content-length header.
App = Jack.ContentLength(App);

// append charset=UTF-8 to content-type header.
App = (function (app) {
    return function (env) {
        var res = app(env),
            ct = HashP.get(res.headers, "Content-Type");
        if (!ct) return res;
        var cs = /charset=([a-z0-9_-]+)/i.exec(ct);
        if (!cs || !cs[1]) HashP.set(
            res.headers, "Content-Type", ct + "; charset=UTF-8"
        );
        return res;
    };
})(App);

// return it;
exports.app = App;
