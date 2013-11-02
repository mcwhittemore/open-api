var type = require("./type");
var regexify = require("./express-utils").pathRegexp;
var validator = require("./validator");
var doctor = require("./doctor");

module.exports = function(api, parent, verOpts) {
    if (verOpts.name == undefined) {
        throw new Error("NAME is a required filed when creating a version");
    }

    var verbs = ["get", "post", "put", "del"];

    var ver = {};
    ver.name = verOpts.name;
    ver.inDocs = verOpts.inDocs || true;
    ver.envs = verOpts.envs || ["dev"];
    ver.available = verOpts.available || true;
    ver.visible = verOpts.available === true && verOpts.envs.indexOf(process.NODE_ENV);
    ver.parent = parent;

    /** =================================================================================================== **/

    ver.endpoints = {}; //this is all the endpoints strongly registered with this version.

    ver.getEndpoint = function(method, route) {
        //starts with self then looks through parents, returns undefined if nothing is ever found.
        if (ver.endpoints[method] && ver.endpoints[method][route]) {
            return ver.endpoints[method][route];
        } else if (parent) {
            return parent.getEndpoint(method, route);
        } else {
            return undefined;
        }
    }

    /** =================================================================================================== **/

    // this is all the exposed regex routes used by 
    // the middleware to start the correct controller
    ver.docRoutes = {};
    ver.apiRoutes = [];

    verbs.forEach(function(name) {
        ver[name] = function(route, opts, controller) {
            opts.route = route;
            opts.controller = controller
            addEndpoint(name.toUpperCase(), opts);
        }
    });

    ver.router = function(routeName, type, req, res, next) {
        //starts with self then looks through parents, calls next if no route is found

        if (type == "docs") {
            console.log(ver.docRoutes);
            if (ver.docRoutes[routeName]) {
                ver.docRoutes[routeName](req, res, next);
            } else if (parent) {
                parent.router(routeName, type, req, res, next);
            } else {
                next();
            }
        } else {
            var found = false;

            for (var i = 0; i < ver.apiRoutes.length; i++) {
                var params = ver.apiRoutes[i].test(routeName);
                if (params) {
                    found = true;
                    req.params = params;
                    ver.apiRoutes[i].controller(req, res, next);
                }
            }

            if (!found) {
                if (parent) {
                    parent.router(routeName, type, req, res, next);
                } else {
                    next();
                }
            }
        }

    }

    /** =================================================================================================== **/

    ver.types = require("./default-types");

    ver.addType = function(name, desc, example, validator) {
        ver.types[name] = type(name, desc, example, validator);
    }

    ver.removeType = function(name) {
        ver.types[name] = type(name, false, false, function() {
            return false
        });
    }

    ver.getType = function(name) {
        if (ver.types[name]) {
            return ver.types[name];
        } else if (parent) {
            return parent.getType(name);
        } else {
            throw new Error("Invalid type: " + name);
        }
    }

    /** =================================================================================================== **/

    var addEndpoint = function(method, opts) {
        if (opts.route == undefined) {
            throw new Error(method + " requires a defined route");
        }

        opts.depecated = opts.depecated || false;
        opts.discontinued = opts.discontinued || false;
        opts.request = opts.request;
        opts.response = opts.response;

        if (opts.discontinued === false && opts.desc == undefined) {
            throw new Error("opts.desc are required for all endpoints: " + method + " " + opts.route);
        }

        var docsRoute = verOpts.docsPath + "/" + opts.route;
        var docsObj = {
            method: method,
            desc: opts.desc,
            depecated: opts.depecated,
            discontinued: opts.discontinued
        };

        var apiRoute = "api/" + method + "/" + opts.route;
        var apiFunction = undefined;

        if (opts.discontinued) {
            apiFunction = validator.discontinued;
        } else {
            if (opts.controller == undefined || opts.request == undefined || opts.response == undefined) {
                console.log(opts);
                var oldEndpoint = parent ? parent.getEndpoint(method, opts.route) : undefined;
                if (oldEndpoint == undefined) {
                    throw new Error("controller, opts.request and opts.response are required when defineing a new endpoint");
                } else {
                    opts.request = opts.request || oldEndpoint.opts.request;
                    ops.response = ops.response || oldEndpoint.opts.response;
                    opts.controller = opts.controller || oldEndpoint.controller;
                }
            }
            docsObj.request = ver.getType(opts.request);
            docsObj.response = ver.getType(opts.response);
            apiFunction = validator(docsObj.request, docsObj.response, opts.controller);
        }

        ver.endpoints[method] = ver.endpoints[method] || {};
        ver.endpoints[method][opts.route] = opts;

        var apiObj = {};
        apiObj.keys = [];
        apiObj.match = regexify(apiRoute, apiObj.keys, verOpts.caseSensitive, verOpts.strictMatching);
        apiObj.test = function(value) { //https://github.com/visionmedia/express/blob/288176bbc9bd66f6844f13fdb72d2a1928545bc3/lib/router/route.js
            var parts = value.match(apiObj.match);

            if (parts) {
                var params = {};
                for (var i = 1; i < parts.length; i++) {
                    if (typeof apiObj.keys[i - 1] == "string") {
                        try {
                            params[decodeURIComponent(apiObj.keys[i - 1])] = parts[i];
                        } catch (err) {
                            params[apiObj.keys[i - 1]] = parts[i];
                        }
                    } else {
                        params[apiObj.keys[i - 1].name] = parts[i];
                    }
                }
                return params;
            } else {
                return null;
            }
        }
        apiObj.controller = apiFunction;

        ver.apiRoutes.push(apiObj);
        ver.docRoutes[docsRoute] = ver.docRoutes[docsRoute] ? ver.docRoutes[docsRoute].add(docsObj) : doctor(docsObj);
    }

    /** =================================================================================================== **/

    return ver;
}