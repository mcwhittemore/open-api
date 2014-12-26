var docsRouteResponder = require("./docs-route-responder");
var docsVersionResponder = require("./docs-version-responder");

module.exports = function(app, versions, versionNames, apiTitle){

    var docVersions = [];

	versionNames.forEach(function(versionName){

        docVersions.push({
            url: "/docs/"+versionName,
            name: versionName
        });

        var version = versions[versionName]
        var versionRoutes = version.routes;
        var routeNames = Object.keys(versionRoutes);

        var docRoutes = [];

        var versionDocData = {};
        versionDocData.routes = docRoutes;
        versionDocData.versions = docVersions;
        versionDocData.apiTitle = apiTitle;
        versionDocData.versionTitle = versionName;
        versionDocData.pageTitle = versionName;
        versionDocData.docsPath = "/docs/"+versionName;
        versionDocData.desc = version.desc;

        app.get(versionDocData.docsPath, function(req, res){

            if (req.mimetype == "json") {
                res.json(versionDocData);
            } else {

                var layoutFile = path.join(__dirname, "../ejs/layout.ejs");
                var menuFile = path.join(__dirname, "../ejs/with-menu.ejs");
                var routeFile = path.join(__dirname, "../ejs/version.ejs");

                res.render([layoutFile, menuFile, routeFile], versionDocData);
            }
        });

        routeNames.forEach(function(routeName){
            var route = versionRoutes[routeName];

            var path = "/"+versionName+routeName;
            var docsPath = "/docs"+path;

            docRoutes.push({
                name: routeName,
                url: docsPath,
                isCurrentPage: false
            });

            var docMethods = {};

            var routeDocData = {};
            routeDocData.routes = docRoutes;
            routeDocData.versions = docVersions;
            routeDocData.apiTitle = apiTitle;
            routeDocData.versionTitle = versionName;
            routeDocData.routeTitle = routeName;
            routeDocData.pageTitle = path;
            routeDocData.docsPath = docsPath;
            routeDocData.methods = docMethods;

            app.get(routeDocData.docsPath, function(req, res){

                if (req.mimetype == "json") {
                    res.json(routeDocData);
                } else {

                    var layoutFile = path.join(__dirname, "../ejs/layout.ejs");
                    var menuFile = path.join(__dirname, "../ejs/with-menu.ejs");
                    var routeFile = path.join(__dirname, "../ejs/route.ejs");

                    res.render([layoutFile, menuFile, routeFile], routeDocData);
                }
            });

            var routeMethods = Object.keys(route);

            routeMethods.sort(function(a, b) {
                return a.localeCompare(b);
            });

            routeMethods.forEach(function(routeMethod){
                var endPoint = route[routeMethod];

                docMethods[routeMethod] = endPoint.docs.join("\n");

                var args = [path].concat(endPoint.fns);

                app[routeMethod].apply(app, args);
            });
        });

        docRoutes.sort(function(a, b) {
            return a.name.localeCompare(b.name);
        });
    });
}