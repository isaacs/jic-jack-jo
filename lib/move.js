// url mapping for move actions.

exports.app = function (env) {
    return {
        status : 200,
        headers : {"Content-Type":"text/plain"},
        body : ["Your move, honky"]
    };
};