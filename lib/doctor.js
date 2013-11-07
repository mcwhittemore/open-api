var ejs = require("ejs");
var path = require("path");

module.exports = function(opts, ver) {

    var find = function(verb) {
        if (doctor.methods[verb]) {
            return doctor.methods[verb];
        } else {
            var p = ver.parent;

            while (p) {
                if (p.docRoutes[opts.docRoute] && p.docRoutes[opts.docRoute].methods[verb]) {
                    return p.docRoutes[opts.docRoute].methods[verb];
                } else {
                    p = p.ver.parent;
                }
            }

            return undefined;
        }
    }

    var doctor = function(req, res, next) {
        var verbs = require("methods");
        var data = {
            methods: {}
        };
        for (var i = 0; i < verbs.length; i++) {
            data.methods[verbs[i]] = find(verbs[i]);
        }

        data.index = [];
        var routes = Object.keys(ver.listEndpoints());
        for (var i = 0; i < routes.length; i++) {
            data.index.push({
                url: "/" + ver.docsPath + "/" + ver.name + "/" + routes[i],
                route: routes[i],
                isActive: routes[i] == opts.apiRoute ? true : false
            });
        }

        data.route_title = opts.apiRoute;
        data.page_title = opts.apiRoute;
        data.api_title = ver.api_name;

        if (req.type == "json") {
            res.json(data);
        } else {

            res.render(path.join(__dirname, "../ejs/route.ejs"), data, function(err, body) {
                if (err) {
                    res.statusCode = 500;
                    res.end("Error");
                    console.log(err);
                } else {
                    data.__yeild = body;
                    res.render(path.join(__dirname, "../ejs/layout.ejs"), data, function(err, body) {
                        if (err) {
                            res.statusCode = 500;
                            res.end("Error");
                            console.log(err);
                        } else {
                            res.end(body);
                        }
                    });
                }
            });
        }
    }

    doctor.methods = {};
    doctor.methods[opts.method] = opts;

    doctor.add = function(opts) {
        doctor.methods[opts.method] = opts;
        return this;
    }

    return doctor;
}