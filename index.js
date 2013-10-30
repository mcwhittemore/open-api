var connect = require("connect");
var version = require("./lib/version");


module.exports = function(opts) {

    process.NODE_ENV = process.NODE_ENV || "dev";

    opts = opts || {};
    opts.publicFolder = opts.publicFolder || 'public';
    opts.logEnv = opts.logEnv || 'dev';
    opts.docsPath = opts.docsPath || 'docs';

    var api = connect();
    api.use(connect.bodyParser());
    api.use(connect.cookieParser());

    api.use(connect.logger(opts.logEnv));
    api.use(connect.static(opts.publicFolder));

    //adding in express' res.json function
    api.use(require("./lib/express-response"));

    var versions = [];
    var versionNameMap = {};

    api.use(function(req, res, next) {
        // 1. Look for api/docs
        // 2. Push along
        next();
    });

    api.version = function(opts) {
        var parent = versions.length != 0 ? versions[versions.length - 1] : null;
        var ver = version(api, parent, opts);
        versions.push(ver);
        versionNameMap[ver.name] = versions.length - 1;
        return ver;
    }

    return api;
}