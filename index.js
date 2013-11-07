var connect = require("connect");
var path = require("path");
var version = require("./lib/version");
var querystring = require("querystring");
var ejs = require("ejs");
var router = require("routes");
var methods = require("methods");
var numMethods = methods.length;

module.exports = function(apiOpts) {

    process.NODE_ENV = process.NODE_ENV || 'development';

    /** ================================ BASE API OPTIONS ================================ **/

    apiOpts = apiOpts || {};
    apiOpts.name = apiOpts.name || "Unnamed API";
    apiOpts.publicFolder = apiOpts.publicFolder || 'public';
    apiOpts.logEnv = apiOpts.logEnv || 'development';
    apiOpts.docsPath = apiOpts.docsPath || 'docs';

    /** ================================== INIT CONNECT ================================== **/

    var api = connect();
    api.use(connect.bodyParser());
    api.use(connect.cookieParser());
    api.use(connect.static(apiOpts.publicFolder));

    /** =========================== ADD PATH, MIMETYPE, QUERY =========================== **/

    api.use(function(req, res, next) {
        var urlParts = req.url.split("?");
        req.path = urlParts[0];

        var mimetype = req.url.match(/\.[\w]*$/);
        if (mimetype) {
            req.mimetype = mimetype[0].replace(".", "");
            req.path = req.path.replace(mimetype, "");
        } else {
            req.mimetype = "default";
        }

        req.query = urlParts[1] ? querystring.parse(urlParts[1]) : {};

        next();
    });

    /** =========================== ADD SEND =========================== **/

    //adding in express' res.json function
    api.use(require("./lib/express-response"));
    api.use(function(req, res, next) {
        res.render = function(files, data, cb) {
            if (typeof files === "string") {
                files = [files];
            }

            var compile = function(i, html) {
                if (i < 0) {
                    sendit(null, html);
                } else {
                    data.__yeild = html;
                    ejs.renderFile(files[i], {
                        locals: data
                    }, function(err, html) {
                        if (err) {
                            sendit(err)
                        } else {
                            compile(i - 1, html);
                        }
                    });
                }
            }

            var sendit = function(err, html) {
                if (cb) {
                    cb(err, html);
                } else if (err) {
                    res.end(err);
                } else {
                    res.end(html);
                }
            }

            ejs.renderFile(files[files.length - 1], {
                locals: data
            }, function(err, html) {
                if (err) {
                    sendit(err)
                } else {
                    compile(files.length - 2, html);
                }
            });
        }
        next();
    });

    /** ========================== ADD ROUTER ========================== **/

    var routes = {};
    methods.forEach(function(name) {
        routes[name] = router();
        api[name] = function(route, controller) {
            routes[name].addRoute(route, controller);
        }
    });

    api.use(function(req, res, next) {
        var route = routes[req.method.toLowerCase()].match(req.path);
        if (route) {
            req.params = route.params;
            req.splats = route.splats;
            route.fn(req, res, next);
        } else {
            next();
        }
    });

    /** ========================= ADD VERSION ========================= **/

    var versions = [];
    var versionNumberMappedToName = {};

    api.version = function(verOpts) {
        verOpts.api_name = apiOpts.name;
        verOpts.docsPath = apiOpts.docsPath;
        var parent = versions.length != 0 ? versions[versions.length - 1] : null;
        var ver = version(api, parent, verOpts);
        versions.push(ver);
        versionNumberMappedToName[ver.name] = versions.length - 1;

        methods.forEach(function(name) {
            routes[name].addRoute("/" + ver.name + "/*", function(req, res, next) {
                if (req.mimetype == "default") {
                    req.mimetype = "json";
                }

                if (ver.isActive()) {
                    ver.router(name + "/" + req.splats, "api", req, res, next);
                } else {
                    next();
                }
            });
        });

        routes["get"].addRoute("/" + apiOpts.docsPath + "/" + ver.name, function(req, res, next) {
            if (req.mimetype == "default") {
                req.mimetype = "html";
            }

            if (ver.isActive() && ver.inDocs) {
                var data = {}
                data.page_title = ver.name;
                data.api_title = ver.api_name;
                data.index = [];
                for (var i = 0; i < versions.length; i++) {
                    if (versions[i].isActive() && versions[i].inDocs) {
                        data.index.push({
                            name: "Version " + versions[i].name,
                            url: "/" + apiOpts.docsPath + "/" + versions[i].name + "/",
                            isCurrentPage: ver.name == versions[i].name
                        });
                    }
                }

                if (req.mimetype == "json") {
                    res.json(data);
                } else {

                    var layoutFile = path.join(__dirname, "./ejs/layout.ejs");
                    var menuFile = path.join(__dirname, "./ejs/with-menu.ejs");
                    var routeFile = path.join(__dirname, "./ejs/version.ejs");

                    res.render([layoutFile, menuFile, routeFile], data);
                }

            } else {
                next();
            }
        });

        routes["get"].addRoute("/" + apiOpts.docsPath + "/" + ver.name + "/*", function(req, res, next) {
            if (req.mimetype == "default") {
                req.mimetype = "html";
            }

            if (ver.isActive() && ver.inDocs) {
                ver.router(req.splats, "docs", req, res, next);
            } else {
                next();
            }
        });

        return ver;
    }

    /** ==================== INIT BASE DOCS ROUTE ==================== **/

    api.get("/" + apiOpts.docsPath, function(req, res) {

    });


    return api;
}