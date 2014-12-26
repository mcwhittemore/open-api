var marked = require("marked");
var fnDocs = require("fn-docs");
var parser = fnDocs();

module.exports = function(path, fns){
	fns = fns || [];

	var docs = [];

	for(var i=0; i<fns.length; i++){
		var doc = parser(fns[i]);
		docs.push(doc);
	}

	return {
		path: path || "",
		docs: marked(docs.join("\n")),
		fns: fns
	};
}