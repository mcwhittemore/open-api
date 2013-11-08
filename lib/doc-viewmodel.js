module.exports = function(req, ver) {
    var data = {};
    data.routes = [];
    data.versions = [];

    var routes = Object.keys(ver.listEndpoints());
    var versions = ver.api.versions;

    for (var i = 0; i < routes.length; i++) {
        data.routes.push({
            name: routes[i],
            url: "/" + ver.docsPath + "/" + req.version + "/" + routes[i],
            isCurrentPage: req.path == "/" + ver.docsPath + "/" + req.version + "/" + routes[i] ? true : false
        });
    }

    for (var i = 0; i < versions.length; i++) {
        if (versions[i].isActive() && versions[i].inDocs) {
            data.versions.push({
                name: "Version " + versions[i].name,
                url: "/" + ver.docsPath + "/" + versions[i].name + "/",
                isCurrentPage: req.version == versions[i].name
            });
        }
    }

    data.routes.sort(function(a, b) {
        return a.name.localeCompare(b.name);
    });

    data.api_title = ver.api_name;
    data.version_title = req.version;

    return data;
}