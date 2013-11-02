module.exports = function(opts) {

    var docRoute = function(req, res, next) {
        var verbs = require("./http-verbs");
        var data = {};
        for (var i = 0; i < verbs.length; i++) {
            data[verbs[i]] = docRoute.find(verbs[i]);
        }
        res.json(data);
    }

    docRoute.methods = {};
    docRoute.methods[opts.method] = opts;

    docRoute.add = function(opts) {
        docRoute.methods[opts.method] = opts;
        return this;
    }

    docRoute.find = function(verb) {
        if (docRoute.methods[verb]) {
            return docRoute.methods[verb];
        } else if (opts.parent) {
            return opts.parent.find(verb);
        } else {
            return undefined;
        }
    }

    return docRoute;
}