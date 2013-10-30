module.exports = function(api, parent, opts) {
    if (opts.name == undefined) {
        throw new Error("NAME is a required filed when creating a version");
    }

    var verbs = ["get", "post", "put", "del"];

    var addRoute = function(method, opts, callback) {
        if (opts.route == undefined) {
            throw new Error(method + " requires a defined route");
        }
        opts.depecated = opts.depecated || false;

        if (callback == undefined && !opts.docs) {
            throw new Error("You must supply an documentation for this new implementation");
        } else if (callback == undefined && parent == undefined) {
            throw new Error("Routes added to the first version, must have a callback");
        } else if (callback == undefined && !parent.hasRoute(method, opts.route)) {
            throw new Error("This route has not been implemented in a previous version");
        }
    }

    var genRouter = function(method, route, callback) {
        return function(req, res, next) {

        }
    }

    var genDocs = function(method, route, docs) {
        return function(req, res, next) {

        }
    }

    var ver = {};
    ver.inDocs = opts.inDocs || true;
    ver.envs = opts.envs || ["dev"];
    ver.available = opts.available || true;
    ver.visible = opts.available === true && opts.envs.indexOf(process.NODE_ENV);
    ver.parent = parent;

    ver.routes = {
        get: {
            "/": {}
        },
        put: {},
        post: {},
        del: {}
    };

    verbs.forEach(function(name) {
        ver[name] = function(route, opts, callback) {
            opts.route = route;
            addRoute(name.toUppercase(), opts, callback);
        }
    });

    ver.hasRoute = function(method, route) {
        return ver.routes[method][route] != undefined;
    }

    return ver;
}