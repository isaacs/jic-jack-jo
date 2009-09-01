var Jack = require("jack"), map = {};

// map the urls to functions as specified
// var map = {
//     "/game" : function (env) {
//         return [200, {"Content-type": "text/plain"}, ["would you like to play a game?"]];
//     }
// };

map["/test"] = function (env) {
    var keys = [];
    for (var i in env) {
        keys.push(i+":"+typeof(env[i])+" "+env[i]+"\n");
    }
    return [200, {"Content-type":"text/plain"}, keys];
};

// map the requests to handlers
require("hashp").HashP.update(map, require("./lib/urlmap"));
exports.app = Jack.URLMap(map);

// serve static stuff from the /static folder.
exports.app = Jack.Static(exports.app, { urls : ["/static"] });

// attach the content-length header.
exports.app = Jack.ContentLength(exports.app);

// support bodiless HEAD request.
exports.app = Jack.Head(exports.app);

// support method swapping
exports.app = Jack.MethodOverride(exports.app);
