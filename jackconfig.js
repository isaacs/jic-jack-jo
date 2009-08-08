var jack = require("jack");

exports.app = jack.ContentLength(function (env) {
    return [200, {"Content-type": "text/plain"}, ["would you like to play a game?"]];
});