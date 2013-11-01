var querystring = require("querystring");
var connect = require("connect");
var version = require("./lib/version");


module.exports = function(apiOpts) {

    process.NODE_ENV = process.NODE_ENV || 'development';

    apiOpts = apiOpts || {};
    apiOpts.publicFolder = apiOpts.publicFolder || 'public';
    apiOpts.logEnv = apiOpts.logEnv || 'development';
    apiOpts.docsPath = apiOpts.docsPath || 'docs';
    if (apiOpts.docsPath == "api") {
        throw new Error("DOCSPATH CANNOT BE API");
    }
    apiOpts.caseSensitive = apiOpts.caseSensitive || false;
    apiOpts.strictMatching = apiOpts.strictMatching || false;

    var api = connect();
    api.use(connect.bodyParser());
    api.use(connect.cookieParser());
    api.use(connect.static(apiOpts.publicFolder));

    //adding in express' res.json function
    api.use(require("./lib/express-response"));

    var versions = [];
    var versionNumberMappedToName = {};

    api.use(function(req, res, next) {

        var urlParts = req.url.split("?");

        var path = urlParts[0];
        var parts = path.split("/").slice(1);

        req.query = urlParts[1] ? querystring.parse(urlParts[1]) : {};

        if (typeof versionNumberMappedToName[parts[0]] != "undefined") {
            var routeName = "api/" + req.method.toLowerCase() + "/" + parts.slice(1).join("/");
            var versionId = versionNumberMappedToName[parts[0]];
            var version = versions[versionId];
            var acceptedRoute = version.router(routeName, "api", req, res, next);
        } else if (parts[0] == apiOpts.docsPath && typeof versionNumberMappedToName[parts[1]] != "undefined") {
            var routeName = apiOpts.docsPath + "/" + parts.slice(2).join("/");
            var versionId = versionNumberMappedToName[parts[1]];
            var version = versions[versionId];
            var acceptedRoute = version.router(routeName, "docs", req, res, next);
        } else {
            next();
        }

    });

    api.version = function(verOpts) {
        verOpts.docsPath = apiOpts.docsPath;
        verOpts.strictMatching = apiOpts.strictMatching;
        verOpts.caseSensitive = apiOpts.caseSensitive;
        var parent = versions.length != 0 ? versions[versions.length - 1] : null;
        var ver = version(api, parent, verOpts);
        versions.push(ver);
        versionNumberMappedToName[ver.name] = versions.length - 1;
        return ver;
    }

    return api;
}