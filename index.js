var connect = require("connect");
var path = require("path");
var version = require("./lib/version");
var querystring = require("querystring");
var router = require("routes");
var methods = require("methods");
var numMethods = methods.length;
var docViewModel = require("./lib/doc-viewmodel");

module.exports = function(apiOpts) {

  process.NODE_ENV = process.NODE_ENV || 'development';

  /** ================================ BASE API OPTIONS ================================ **/

  apiOpts = apiOpts || {};
  apiOpts.name = apiOpts.name || "Unnamed API";
  apiOpts.publicFolder = apiOpts.publicFolder || 'public';
  apiOpts.logEnv = apiOpts.logEnv || 'development';
  apiOpts.docsPath = apiOpts.docsPath || 'docs';

  /** ================================== INIT CONNECT ================================== **/

  var api = connect();
  api.use(connect.bodyParser());
  api.use(connect.cookieParser());
  api.use(connect.static(apiOpts.publicFolder));

  /** =========================== ADD PATH, MIMETYPE, QUERY ============================ **/

  api.use(function(req, res, next) {
    var urlParts = req.url.split("?");
    req.path = urlParts[0];

    var mimetype = req.url.match(/\.[\w]*$/);
    if (mimetype) {
      req.mimetype = mimetype[0].replace(".", "");
      req.path = req.path.replace(mimetype, "");
    } else {
      req.mimetype = "default";
    }

    req.query = urlParts[1] ? querystring.parse(urlParts[1]) : {};

    next();
  });

  /** ========================== ADD RES.JSON AND RES.RENDER ========================== **/

  //adding in express' res.json function
  api.use(require("./lib/express-response"));
  api.use(require("ejs-list-render")
    .connect);

  /** ================================== ADD ROUTER =================================== **/

  var routes = {};
  methods.forEach(function(name) {
    routes[name] = router();
    api[name] = function(route, controller) {
      routes[name].addRoute(route, controller);
    }
  });

  api.use(function(req, res, next) {
    var route = routes[req.method.toLowerCase()].match(req.path);
    if (route) {
      req.params = route.params;
      req.splats = route.splats;
      route.fn(req, res, next);
    } else {
      next();
    }
  });

  /** ================================== ADD VERSION ================================= **/

  api.versions = [];
  var versionNumberMappedToName = {};

  var versionRender = function(req, res, ver) {
    req.version = ver.name;

    if (req.mimetype == "default") {
      req.mimetype = "html";
    }

    var data = docViewModel(req, ver);
    data.page_title = ver.name;

    data.desc = ver.desc;

    if (req.mimetype == "json") {
      res.json(data);
    } else {

      var layoutFile = path.join(__dirname, "./ejs/layout.ejs");
      var menuFile = path.join(__dirname, "./ejs/with-menu.ejs");
      var routeFile = path.join(__dirname, "./ejs/version.ejs");

      res.render([layoutFile, menuFile, routeFile], data);
    }
  }

  api.version = function(verOpts) {
    verOpts.api_name = apiOpts.name;
    verOpts.docsPath = apiOpts.docsPath;
    var parent = api.versions.length != 0 ? api.versions[api.versions.length - 1] : null;
    var ver = version(api, parent, verOpts);
    api.versions.push(ver);
    versionNumberMappedToName[ver.name] = api.versions.length - 1;

    methods.forEach(function(name) {
      routes[name].addRoute("/" + ver.name + "/*", function(req, res, next) {
        if (req.mimetype == "default") {
          req.mimetype = "json";
        }

        if (ver.isActive()) {
          ver.router(name + "/" + req.splats, "api", req, res, next);
        } else {
          next();
        }
      });
    });

    routes["get"].addRoute("/" + apiOpts.docsPath + "/" + ver.name, function(req, res, next) {
      if (ver.isActive() && ver.inDocs) {
        versionRender(req, res, ver);
      } else {
        next();
      }
    });

    routes["get"].addRoute("/" + apiOpts.docsPath + "/" + ver.name + "/*", function(req, res, next) {
      if (ver.isActive() && ver.inDocs) {
        if (req.mimetype == "default") {
          req.mimetype = "html";
        }
        ver.router(req.splats, "docs", req, res, next);
      } else {
        next();
      }
    });

    return ver;
  }

  /** ============================== INIT BASE DOCS ROUTE ============================== **/

  api.get("/" + apiOpts.docsPath, function(req, res, next) {
    var ver = undefined;
    for (var i = api.versions.length - 1; i >= 0; i--) {
      if (api.versions[i].isActive() && api.versions[i].inDocs) {
        ver = api.versions[i];
        break;
      }
    }

    if (ver) {
      versionRender(req, res, ver);
    } else {
      next();
    }
  });


  return api;
}