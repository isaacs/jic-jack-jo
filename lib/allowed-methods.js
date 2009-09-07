exports.AllowedMethods = function (app, methods) {
    return function (env) {
        if (methods.indexOf(env.REQUEST_METHOD) === -1) return {
            status : 405,
            headers : {"Content-Type":"text/plain"},
            body : [
                "Method Not Allowed: "+env["REQUEST_METHOD"] +"\n"+
                "Allowed methods: "+methods.join(",")
            ]
        };
        return app(env);
    };
};
            