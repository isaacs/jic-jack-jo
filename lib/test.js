var Jack = require("jack"), map = {};

function TestApp (env) {
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

exports.app = Jack.URLMap({
    "/" : TestApp,
    "/nested" : Jack.URLMap({
        "/nested-again" : TestApp,
        "/" : TestApp
    })
});

