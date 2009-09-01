var HashP = require("hashp").HashP;

HashP.update(exports, {
    "/from-the-map" : function (env) {
        return [200, {"Content-type": "text/plain"}, ["mad mappin"]];
    }
});
HashP.update(exports, require("./urlmap/game"));
HashP.update(exports, require("./urlmap/move"));
