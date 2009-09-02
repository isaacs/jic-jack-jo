// the url map for game-related actions.

var Jack = require("jack"), HashP = require("hashp").HashP;

exports.app = function (env) {
    
    var game = {
		"id" : env.PATH_INFO.replace(/(^\/+|\/+$)/, '').replace(/\//g, '-'),
		"x" : null,
		"o" : null,
		"state" : [["","",""],["","",""],["","","x"]],
		"turn" : "o",
		"win" : null
	};
    
    return new Jack.Response(200, {"Content-Type":"text/javascript"}, [JSON.stringify(game)]).finish();
};