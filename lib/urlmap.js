var HashP = require("hashp").HashP;
HashP.update(exports, {
    "/game" : require("./game").app,
    "/move" : require("./move").app,
    "/" : function (env) {
        var File = require("jack/file").File,
            file = require("file"),
            fileServer = File(file.cwd() + "/index.html"),
            resp = fileServer(env);
        HashP.update(resp.headers, {"Content-Type":"text/html"});
        return resp;
    }
});
