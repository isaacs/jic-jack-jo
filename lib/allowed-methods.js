exports.AllowedMethods = function (app, methods) {
    return function (env) {
        if (methods.indexOf(env.REQUEST_METHOD) === -1) return {
            status : 405,
            headers : {
                "Content-Type" : "application/json",
                "Allow" : methods.join(",")
            },
            body : [JSON.stringify({
                error : "Method Not Allowed: "+env["REQUEST_METHOD"],
                allow : methods
            })]
        };
        return app(env);
    };
};
            