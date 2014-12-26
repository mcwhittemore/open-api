var fnDocs = require("fn-docs");
var parser = fnDocs();

module.exports = function(path, fns, method, version){
	var result = {
		path: path || "",
		method: method || method,
		versions: version ? [version] : [],
		docs: [],
		fns: fns || []
	}

	for(var i=0; i<result.fns.length; i++){
		var doc = parser(result.fns[i]);
		result.docs.push(doc);
	}

	return result;
}