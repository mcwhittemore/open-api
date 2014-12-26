var docsResponder = require("./docs-responder");

module.exports = function(app, versions, versionNames, apiTitle){
	versionNames.forEach(function(versionName){
        var version = versions[versionName];
        var routeNames = Object.keys(version);

        var docRoutes = [];

        routeNames.forEach(function(routeName){
            var route = version[routeName];

            var path = "/"+versionName+routeName;
            var docsPath = "/docs"+path;

            docRoutes.push({
                name: routeName,
                url: docsPath,
                isCurrentPage: false
            });

            var docMethods = {};

            var docsData = {};
            docsData.routes = docRoutes;
            docsData.versions = versionNames;
            docsData.apiTitle = apiTitle;
            docsData.versionTitle = versionName;
            docsData.routeTitle = routeName;
            docsData.pageTitle = path;
            docsData.docsPath = docsPath;
            docsData.methods = docMethods;

            docsResponder(app, docsData);

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