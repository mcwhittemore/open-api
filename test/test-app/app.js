var openApi = require("../../");
var api = openApi();

require("./endpoints/0.1.js")(api.version({
    name: "0.1",
    inDocs: false,
    envs: ["dev"]
}));

require("./endpoints/0.2.js")(api.version({
    name: "0.2",
    inDocs: true,
    envs: ["dev"]
}));

api.use(function(req, res, next) {
    res.end("END OF THE LINE");
});

var http = require("http");
http.createServer(api).listen(3000);