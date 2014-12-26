module.exports = function(versions){
	var curBase = versions[0].routes;
	var nextBase = {};
	for(var i=1; i<versions.length; i++){
		var verName = versions[i].name;
		var verRoutes = versions[i].routes;

		var verPaths = Object.keys(verRoutes);
		var curPaths = Object.keys(curBase);

		for(var j=0; j<curPaths.length; j++){
			var curPath = curPaths[j];

			nextBase[curPath] = {};

			var verRouteMethods = verRoutes[curPath] || {};

			var curMethods = Object.keys(curBase[curPath]);
			for(var k=0; k<curMethods.length; k++){
				var curMethod = curMethods[k];
				if(verRouteMethods[curMethod]===undefined){
					curBase[curPath][curMethod].versions.push(verName);
					nextBase[curPath][curMethod] = curBase[curPath][curMethod];
				}
			}

			var verMethods = Object.keys(verRouteMethods);
			for(var k=0; k<verMethods.length; k++){
				var verMethod = verMethods[k];
				nextBase[curPath][verMethod] = verRouteMethods[verMethod];
			}

		}

		curBase = nextBase;
		nextBase = {};
	}
}