var methods = require("methods");
var Route = require("./route");
module.exports = function(desc){
	var ver = {};

    ver.desc = desc;

	ver.routes = {};

	ver.endUser = {};

	methods.forEach(function(method){
		ver.endUser[method] = function(){
  			var fns = Array.prototype.splice.call(arguments,1);
  			var path = arguments[0];
  			var route = Route(path, fns);
  			if(ver.routes[path]===undefined){
  				ver.routes[path] = {};
  			}

  			ver.routes[path][method] = route;
		}
	});

	return ver;
}