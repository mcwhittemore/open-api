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
        return undefined;
    }

    /** =================================================================================================== **/

    // this is all the exposed regex routes used by 
    // the middleware to start the correct controller
    ver.routes = {};

    verbs.forEach(function(name) {
        ver[name] = function(route, opts, controller) {
            opts.route = route;
            opts.controller = controller
            addEndpoint(name.toUpperCase(), opts);
        }
    });

    ver.router = function(routeName, req, res, next) {
        //starts with self then looks through parents, calls next if no route is found
        console.log(routeName, req.query);
        next();
    }

    /** =================================================================================================== **/

    ver.types = require("./default-types");

    ver.getType = function(name) {
        //starts with self than looks through parents, throws error if no type is found
        throw new Error("Invalid type: " + name);
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

        var docRoute = verOpts.docRoute + "/" + opts.route;
        var docsObj = {
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

        ver.routes[apiRoute] = apiFunction;
        ver.routes[docRoute] = doctor(docsObj);
    }

    /** =================================================================================================== **/

    return ver;
}