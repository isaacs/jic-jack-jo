// the url map for game-related actions.

var Jack = require("jack"), HashP = require("hashp").HashP;

require("hashp").HashP.update(exports, {
    "/game/" : function (env) {
        return [200, {
            "X-Foo-Bar" : "loves you",
            "Content-Type" : "text/javascript"
        }, [JSON.stringify({
    		"id" : 12345,
    		"x" : null,
    		"o" : null,
    		"state" : [["","",""],["","",""],["","","x"]],
    		"turn" : "o",
    		"win" : null
    	})]];
    }
});