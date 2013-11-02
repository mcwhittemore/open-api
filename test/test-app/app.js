var openApi = require("../../");
var api = openApi();

require("./endpoints/0.1.js")(api.version({
    name: "0.1",
    inDocs: true,
    envs: ["development", "staging", "production"]
}));

require("./endpoints/0.2.js")(api.version({
    name: "0.2",
    inDocs: false,
    envs: ["development", "staging"]
}));

require("./endpoints/0.3.js")(api.version({
    name: "0.3",
    inDocs: true,
    envs: ["development"]
}));

api.use(function(req, res, next) {
    res.end("END OF THE LINE");
});

var http = require("http");
http.createServer(api).listen(3000);