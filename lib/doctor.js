var path = require("path");
var docViewModel = require("./doc-viewmodel");

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
                    p = p.parent;
                }
            }

            return undefined;
        }
    }

    var doctor = function(req, res, next) {
        var methods = require("methods");

        var vvv = ver;

        for (var i = ver.api.versions.length - 1; i >= 0; i--) {
            if (ver.api.versions[i].name == req.version) {
                vvv = ver.api.versions[i];
                break;
            }
        }

        var data = docViewModel(req, vvv);
        data.route_title = opts.apiRoute;
        data.page_title = opts.apiRoute;
        data.methods = {};
        for (var i = 0; i < methods.length; i++) {
            var controller = find(methods[i]);
            if (controller != undefined) {
                data.methods[methods[i]] = controller;
            }
        }

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