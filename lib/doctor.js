module.exports = function(opts, parent) {

    var find = function(verb) {
        if (docRoute.methods[verb]) {
            return docRoute.methods[verb];
        } else {
            var p = parent;

            while (p) {
                if (p.docRoutes[opts.route] && p.docRoutes[opts.route].methods[verb]) {
                    return p.docRoutes[opts.route].methods[verb];
                } else {
                    p = p.parent;
                }
            }

            return undefined;
        }
    }

    var docRoute = function(req, res, next) {
        var verbs = require("./http-verbs");
        var data = {};
        for (var i = 0; i < verbs.length; i++) {
            data[verbs[i]] = find(verbs[i]);
        }
        res.json(data);
    }

    docRoute.methods = {};
    docRoute.methods[opts.method] = opts;

    docRoute.add = function(opts) {
        docRoute.methods[opts.method] = opts;
        return this;
    }

    return docRoute;
}