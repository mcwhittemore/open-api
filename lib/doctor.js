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
        var methods = require("methods");
        var data = {
            methods: {}
        };
        for (var i = 0; i < methods.length; i++) {
            var controller = find(methods[i]);
            if (controller != undefined) {
                data.methods[methods[i]] = controller;
            }
        }

        data.index = [];
        var routes = Object.keys(ver.listEndpoints());
        for (var i = 0; i < routes.length; i++) {
            data.index.push({
                name: routes[i],
                url: "/" + ver.docsPath + "/" + req.version + "/" + routes[i],
                isCurrentPage: routes[i] == opts.apiRoute ? true : false
            });
        }

        data.route_title = opts.apiRoute;
        data.page_title = opts.apiRoute;
        data.api_title = ver.api_name;
        data.version_title = req.version;

        if (req.mimetype == "json") {
            res.json(data);
        } else {

            var layoutFile = path.join(__dirname, "../ejs/layout.ejs");
            var menuFile = path.join(__dirname, "../ejs/with-menu.ejs");
            var routeFile = path.join(__dirname, "../ejs/route.ejs");

            res.render([layoutFile, menuFile, routeFile], data);
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