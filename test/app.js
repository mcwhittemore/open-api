var openApi = require("../");

var app = openApi();

var http = require("http");

http.createServer(app).listen(3000);