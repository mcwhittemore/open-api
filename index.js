var Version = require("./lib/version");
var versionMerger = require("./lib/merge-versions");
var appBuilder = require("./lib/app-builder");
var express = require("express");
var ejsListRender = require("ejs-list-render");


module.exports = function(apiTitle){
    var app = express();

    app.use(ejsListRender.connect);

    var opi = {};
    opi.listen = app.listen.bind(app);

    var versions = {};
    var versionNames = [];

    opi.version = function(name){
        var version = Version(name);
        versions[name] = version;
        versionNames.push(name);
        return version.endUser;
    }

    setTimeout(function(){
        versionMerger(versions);
        appBuilder(app, versions, versionNames, apiTitle);
    },0);

    return opi;
}