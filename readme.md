# Open API

An API server that forces versioning, simplifies deprecation, and automates documentation and data validation.

## Versioning

```
var v1 = api.version({
	name:"something-for-a-url",
	envs:["list", "of", "envs", "this", "is", "active", "for"]
});

var v2 = api.version({
	name:"v2",
	envs:["development"]
});
```

## Data Validation

```
v1.addValidator(
	"data-validator-name",
	"desc for docs",
	function(value){ 
		return value=="is valid";
	}
);

v1.addValidator(
    "data-validator-with file stream",
    fs.createReadStream("path/to/file.md", {encoding:"utf8"}),
    function(value){ 
        return value=="is valid";
    }
);
```

## Route Creation and Deprecation

```
var opts = {
	validate: {
		request: "data-validator-name",
		response: "data-validator-name"
	},
	desc: "Some explanation for the docs"
}

v1.get("route-path", opts, function(req, res){
	res.json({"the":"payload"});
});

v2.get("route-path", {discontinued:true});
```

## Middleware run before a versions routes

```
ver.use(function(req, res, next){
    next();
});
```

## Middleware run before version detection

```
api.before(function(req, res, next){
    req.user = "Robert Frost";
    next();
});

## Example App.js

```
var openApi = require("../../");
var api = openApi();

//create a version of your api
var v1 = api.version({
    name: "v1",
    envs: ["development", "staging", "production"]
});

//add an endpoint
v1.get("foo", {
    validate: {
    	request: "empty",
    	response: "object"
    },
    desc: "Returns the message foo"
}, function(req, res) {
    res.json({"message":"foo"});
});

//create another version
var v2 = api.version({
    name: "v2",
    envs: ["development", "staging"]
});

//add another endpoint
v2.get("bar", {
    validate: {
    	request: "empty",
    	response: "object"
    },
    desc: "Returns the message bar"
}, function(req, res) {
    res.json({"message":"bar"});
});

//create a thrid version!
var v3 = api.version({
    name: "v3",
    envs: ["development"]
});

//remove an endpoint
v3.get("foo", {discontinued:true});


var http = require("http");
http.createServer(api).listen(3000);
```

## Baked In Middleware

### Tracking

```
var openApi = require("open-api");
var api = openApi();
api.before(openApi.middleware.tracking(function(req, res){
    console.log("REQUEST TO TRACK", req.trackId);
}, function(req, res){
    console.log("REPONSE TO TRACK", req.trackId);
}, function(req){
    //to track or not to track
    //return ture or false
    return req.url.match(/^\/$|^\/docs/) == null; //default
}));
```

