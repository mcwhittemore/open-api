var connect = require("connect");
var version = require("./lib/version");
var ejs = require("ejs");

module.exports = function(apiOpts) {

    process.NODE_ENV = process.NODE_ENV || 'development';

    apiOpts = apiOpts || {};
    apiOpts.name = apiOpts.name || "Unnamed API";
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
    api.use(function(req, res, next) {
        res.render = function(file, data, cb) {
            //TODO: Make this not force ejs
            //TODO: Have this send the data is no cb
            //TODO: Have this take a status code
            ejs.renderFile(file, {
                locals: data
            }, cb);
        }
        next();
    });

    var versions = [];
    var versionNumberMappedToName = {};

    api.use(require("./lib/docs-and-api-router")(apiOpts, versions, versionNumberMappedToName));

    api.version = function(verOpts) {
        verOpts.api_name = apiOpts.name;
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