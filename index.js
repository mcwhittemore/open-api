var Version = require("./lib/version");
var merger = require("./lib/merge-versions");
var express = require("express");


module.exports = function(){
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
        
        for(var i=0; i<versionNames.length; i++){
            var versionName = versionNames[i];
            var version = versions[versionName];
            var routeNames = Object.keys(version);
            for(var j=0; j<routeNames.length; j++){
                var routeName = routeNames[j];
                var route = version[routeName];

                var routeMethods = Object.keys(route);

                for(var k=0; k<routeMethods.length; k++){
                    var routeMethod = routeMethods[k];
                    var endPoint = route[routeMethod];

                    var path = "/"+versionName+endPoint.path;
                    var args = [path].concat(endPoint.fns);

                    app[routeMethod].apply(app, args);
                }

            }
        }

    },0);

    return opi;
}