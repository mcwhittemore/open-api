var querystring = require("querystring");

module.exports = function(apiOpts, versions, versionNumberMappedToName) {
    return function(req, res, next) {

        var urlParts = req.url.split("?");

        var type = req.url.match(/\.[\w]*$/);
        if (type) {
            req.type = type[0].replace(".", "");
        }

        var path = urlParts[0];
        var parts = path.split("/").slice(1);

        req.query = urlParts[1] ? querystring.parse(urlParts[1]) : {};

        if (typeof versionNumberMappedToName[parts[0]] != "undefined") {
            var method = req.method == "DELETE" ? "del" : req.method.toLowerCase();
            var routeName = "api/" + method + "/" + parts.slice(1).join("/");
            var versionId = versionNumberMappedToName[parts[0]];
            var version = versions[versionId];
            if (version.isActive()) {
                var acceptedRoute = version.router(routeName, "api", req, res, next);
            } else {
                next();
            }
        } else if (parts[0] == apiOpts.docsPath && typeof versionNumberMappedToName[parts[1]] != "undefined") {
            var method = req.method == "DELETE" ? "del" : req.method.toLowerCase();
            var routeName = apiOpts.docsPath + "/" + parts.slice(2).join("/");
            var versionId = versionNumberMappedToName[parts[1]];
            var version = versions[versionId];
            if (version.inDocs && version.isActive()) {
                var acceptedRoute = version.router(routeName, "docs", req, res, next);
            } else {
                next();
            }
        } else {
            next();
        }

    }
}