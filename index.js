var Version = require("./lib/version");
var merger = require("./lib/merge-versions");
var express = require("express");


module.exports = function(apiTitle){
    var app = express();

    var opi = {};
    opi.listen = app.listen.bind(app);

    var versions = {};
    var versionNames = [];

    opi.version = function(name){
        var version = Version();
        versions[name] = version.routes;
        versionNames.push(name);
        return version.endUser;
    }

    setTimeout(function(){
        merger(versions);
        
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

                app.get(docsPath, function(req, res){
                    var docs = {};
                    docs.routes = docRoutes;
                    docs.versions = versionNames;
                    docs.apiTitle = apiTitle;
                    docs.versionTitle = versionName;
                    docs.routeTitle = routeName;
                    docs.pageTitle = path;
                    docs.methods = docMethods;

                    res.json(docs);
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

    },0);

    return opi;
}