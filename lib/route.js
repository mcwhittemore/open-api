var fnDocs = require("fn-docs");
var parser = fnDocs();

module.exports = function(path, fns){
	fns = fns || [];

	var result = {
		path: path || "",
		docs: [],
		fns: fns
	}

	for(var i=0; i<fns.length; i++){
		var doc = parser(fns[i]);
		result.docs.push(doc);
	}

	return result;
}