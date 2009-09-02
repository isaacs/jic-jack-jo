
require("hashp").HashP.update(exports, {
    "/game" : require("./game").app,
    "/move" : require("./move").app
});
