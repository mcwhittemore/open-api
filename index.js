var connect = require('connect');


module.exports = function(opts) {

    opts = opts || {};
    opts.publicFolder = opts.publicFolder || 'public';
    opts.logEnv = opts.logEnv || 'dev';
    opts.docsPath = opts.docsPath || 'docs';
    opts.versionStub = opts.versionStub || '';
    opts.endpointFolder = opts.endpointFolder || 'endpoints';

    var app = connect();
    app.use(connect.bodyParser());
    app.use(connect.cookieParser());

    app.use(connect.logger(opts.logEnv));
    app.use(connect.static(opts.publicFolder));

    //adding in express' res.json function
    app.use(require("./lib/express-response"));

    app.use(function(req, res, next) {
        res.json(req.headers);
    });


    return app;
}