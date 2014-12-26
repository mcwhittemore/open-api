var Version = require("./lib/version");
var merger = require("./lib/merge-versions");
var express = require("express");


module.exports = function(){
    var app = express();

    var opi = {};
    opi.listen = app.listen.bind(app);

    var versions = [];

    opi.version = function(name){
        var version = Version(name);
        versions.push(version);
        return version.endUser;
    }

    setTimeout(function(){
        merger(versions);
        
        for(var i=0; i<versions.length; i++){
            var routes = Object.keys(versions[i].routes);
            for(var j=0; j<routes.length; j++){
                var route = versions[i].routes[routes[j]];

                var routeMethods = Object.keys(route);

                for(var k=0; k<routeMethods.length; k++){
                    var routeMethod = routeMethods[k];
                    var endPoint = route[routeMethod];

                    var routeVers = endPoint.versions;
                    for(var l=0; l<routeVers.length; l++){
                        var ver = routeVers[l];
                        var path = "/"+ver+endPoint.path;
                        var args = [path].concat(endPoint.fns);

                        app[routeMethod].apply(app, args);
                    }
                }

            }
        }

    },0);

    return opi;
}