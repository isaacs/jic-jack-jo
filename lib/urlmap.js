require("hashp").HashP.update(exports,
    {
        "/from-the-map" : function (env) {
            return [200, {"Content-type": "text/plain"}, ["mad mappin"]];
        }
    },
    require("./urlmap/game"),
    require("./urlmap/move")
);
