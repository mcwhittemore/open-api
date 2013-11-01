module.exports = function(ver, route, opts) {

    var docRoute = function(req, res, next) {
        res.json(docRoute.methods);
    }

    docRoute.methods = ver.parent == null ? {} : ver.parent.findRoute(route, "docs") || {};
    docRoute.methods[opts.method] = opts;

    docRoute.add = function(opts) {
        methods[opts.method] = opts;
        return this;
    }

    return docRoute;
}