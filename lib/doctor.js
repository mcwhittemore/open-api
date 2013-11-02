module.exports = function(opts, parent) {

    var find = function(verb) {
        if (doctor.methods[verb]) {
            return doctor.methods[verb];
        } else {
            var p = parent;

            while (p) {
                if (p.docRoutes[opts.docRoute] && p.docRoutes[opts.docRoute].methods[verb]) {
                    return p.docRoutes[opts.docRoute].methods[verb];
                } else {
                    p = p.parent;
                }
            }

            return undefined;
        }
    }

    var doctor = function(req, res, next) {
        var verbs = require("./http-verbs");
        var data = {};
        for (var i = 0; i < verbs.length; i++) {
            data[verbs[i]] = find(verbs[i]);
        }
        res.json(data);
    }

    doctor.methods = {};
    doctor.methods[opts.method] = opts;

    doctor.add = function(opts) {
        doctor.methods[opts.method] = opts;
        return this;
    }

    return doctor;
}