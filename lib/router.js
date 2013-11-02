var regexify = require("./express-utils").pathRegexp;

module.exports = function(apiRoute, verOpts, controller) {
    var apiObj = {};
    apiObj.keys = [];
    apiObj.match = regexify(apiRoute, apiObj.keys, verOpts.caseSensitive, verOpts.strictMatching);
    apiObj.test = function(value) { //https://github.com/visionmedia/express/blob/288176bbc9bd66f6844f13fdb72d2a1928545bc3/lib/router/route.js
        var parts = value.match(apiObj.match);

        if (parts) {
            var params = {};
            for (var i = 1; i < parts.length; i++) {
                if (typeof apiObj.keys[i - 1] == "string") {
                    try {
                        params[decodeURIComponent(apiObj.keys[i - 1])] = parts[i];
                    } catch (err) {
                        params[apiObj.keys[i - 1]] = parts[i];
                    }
                } else {
                    params[apiObj.keys[i - 1].name] = parts[i];
                }
            }
            return params;
        } else {
            return null;
        }
    }
    apiObj.controller = controller;
    return apiObj;
}