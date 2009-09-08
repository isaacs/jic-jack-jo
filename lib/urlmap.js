var HashP = require("hashp").HashP;
HashP.update(exports, {
    "/game" : require("./game").app,
    "/move" : require("./move").app,
    "/" : function (env) {
        var resp = require("jack/file").File(require("file").cwd() + "/index.html")(env);
        HashP.update(resp.headers, {"Content-Type":"text/html"});
        return resp;
    }
});
