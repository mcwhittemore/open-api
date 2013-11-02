module.exports = function(opts) {
    var methods = {};
    methods[opts.method] = opts;

    var docRoute = function(req, res, next) {
        res.json(methods);
    }

    docRoute.add = function(opts) {
        methods[opts.method] = opts;
        return this;
    }

    return docRoute;
}