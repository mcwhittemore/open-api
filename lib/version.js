var validator = require("./validator");
var controllerify = require("./controllerify");
var doctor = require("./doctor");
var routes = require("routes");
var methods = require("methods");
var ContextError = require("context-error");
var reader = require("./reader");

module.exports = function(api, parent, verOpts) {
    if (verOpts.name == undefined) {
        throw new Error("NAME is a required filed when creating a version");
    }

    var ver = {};
    ver.name = verOpts.name;
    ver.desc = verOpts.desc || "";
    ver.api_name = verOpts.api_name;
    ver.docsPath = verOpts.docsPath;
    ver.inDocs = verOpts.inDocs === false ? false : true;
    ver.envs = verOpts.envs || ["dev"];
    ver.available = verOpts.available === false ? false : true;
    ver.parent = parent;
    ver.api = api;

    if (typeof ver.desc != "string") {
        reader(ver.desc, function(err, desc) {
            ver.desc = desc;
        });
    } else {
        reader.parser([ver.desc], function(err, desc) {
            ver.desc = desc;
        });
    }

    /** =================================================================================================== **/

    //helper function
    ver.isActive = function() {
        return ver.available && ver.envs.indexOf(process.NODE_ENV) != -1;
    }

    /** =================================================================================================== **/

    //this is all the endpoints strongly registered with this version.
    ver.endpoints = {};

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

    ver.listEndpoints = function() {
        var data = {};
        var p = ver;
        var found = {}
        while (p != undefined) {
            for (var i = 0; i < methods.length; i++) {
                var routes = p.endpoints[methods[i]] ? Object.keys(p.endpoints[methods[i]]) : [];
                for (var j = 0; j < routes.length; j++) {

                    if (found[routes[j]] == undefined) {
                        found[routes[j]] = {};
                    }

                    if (found[routes[j]][methods[i]] == undefined) {
                        found[routes[j]][methods[i]] = true;
                        if (p.endpoints[methods[i]][routes[j]].discontinued == false) {
                            if (data[routes[j]] == undefined) {
                                data[routes[j]] = {};
                            }
                            data[routes[j]][methods[i]] = true;
                        }
                    }
                }
            }
            p = p.parent;
        }

        return data;
    }

    /** =================================================================================================== **/

    ver.docRoutes = {};
    ver.apiRoutes = routes();

    methods.forEach(function(name) {
        ver[name] = function(route, opts, controller) {
            opts.route = route.replace(/^\//, "");
            opts.controller = controller
            addEndpoint(name, opts);
        }
    });

    var middleware = [];

    ver.use = function(mid) {
        middleware.push(mid);
    }

    var middleRunner = function(i, req, res, next) {
        if (middleware[i]) {
            middleware[i](req, res, function() {
                middleRunner(i + 1, req, res, next);
            });
        } else {
            next();
        }
    }

    ver.router = function(req, res, next) {
        //starts with self then looks through parents, calls next if no route is found

        if (req.version == undefined) {
            req.version = ver.name;
        }

        middleRunner(0, req, res, function() {
            if (req.isDocs) {
                if (ver.docRoutes[req.path]) {
                    ver.docRoutes[req.path](req, res, next);
                } else if (parent) {
                    parent.router(req, res, next);
                } else {
                    next();
                }
            } else {
                var route = ver.apiRoutes.match(req.path);

                if (route) {
                    req.route = route.route;
                    req.params = route.params;
                    req.splats = route.splats;
                    route.fn(req, res, next);
                } else if (parent) { //look to a parent
                    //if the route isn't on this version
                    parent.router(req, res, next);
                } else { //or give up
                    next();
                }
            }
        });
    }

    /** =================================================================================================== **/

    ver.validators = parent == null ? require("./base-validators") : {};

    ver.addValidator = function(name, desc, isValid) {
        var v = validator(name, desc, isValid);
        ver.validators[name] = v;
    }

    ver.removeValidator = function(name) {
        ver.validators[name] = validator(name, false, false, function() {
            return false
        });
    }

    ver.getValidator = function(name) {
        if (ver.validators[name]) {
            return ver.validators[name];
        } else if (parent) {
            return parent.getValidator(name);
        } else {
            throw ContextError("Invalid Validator: " + name, 5);
        }
    }

    /** =================================================================================================== **/

    var addEndpoint = function(method, opts) {
        //make sure there is a route
        if (opts.route == undefined) {
            throw new Error(method + " requires a defined route");
        }

        //set required fileds
        opts.depecated = opts.depecated || false;
        opts.discontinued = opts.discontinued || false;
        opts.validate = opts.validate || {};

        //confirm documentation for changes
        if (opts.discontinued === false && opts.desc == undefined) {
            throw ContextError("opts.desc are required for all endpoints: " + method + " " + opts.route, 4);
        }

        //object to be used to create docs
        var docRoute = opts.route; //this is ket for version.docRoutes and not a url
        var docsObj = {
            docRoute: docRoute,
            apiRoute: opts.route,
            method: method,
            desc: opts.desc,
            depecated: opts.depecated,
            discontinued: opts.discontinued,
        };

        var apiRoute = method + "/" + opts.route; //this is a key for version.apiRoutes and not a url
        var apiFunction = undefined; //this will be the function that responds to requests

        if (opts.discontinued) { //if this endpoint is discontinued, provide the discontinued controller
            apiFunction = controllerify.discontinued;
        } else {
            //fill out any non modified parts of the route with the parts from before
            if (opts.controller == undefined || opts.validate.request == undefined || opts.validate.response == undefined) {
                var oldEndpoint = parent ? parent.getEndpoint(method, opts.route) : undefined;

                if (oldEndpoint == undefined) {
                    throw ContextError("Controller, opts.validate.request and opts.validate.response are required when defineing a new endpoint", 4);
                } else {
                    opts.validate.request = opts.validate.request || oldEndpoint.validate.request;
                    opts.validate.response = opts.validate.response || oldEndpoint.validate.response;
                    opts.controller = opts.controller || oldEndpoint.controller;
                    opts.validate.params = opts.validate.params || oldEndpoint.validate.params;
                }
            }

            //add more detail to the docs
            docsObj.request = ver.getValidator(opts.validate.request);
            docsObj.response = ver.getValidator(opts.validate.response);
            docsObj.params = ver.getValidator(opts.validate.params || "auto-pass");

            //create validated controller for route
            apiFunction = controllerify(docsObj.request, docsObj.params, docsObj.response, opts.controller);
        }

        //add the raw route data to an endpoints kvp so we can look it up easily
        ver.endpoints[method] = ver.endpoints[method] || {};
        ver.endpoints[method][opts.route] = opts;

        //add api route to the apiRoutes
        ver.apiRoutes.addRoute(apiRoute, apiFunction);

        //create a new docRoute if needed, else add this http-verb to exhisting
        ver.docRoutes[docRoute] = ver.docRoutes[docRoute] ? ver.docRoutes[docRoute].add(docsObj) : doctor(docsObj, ver);
    }

    /** =================================================================================================== **/

    return ver;
}