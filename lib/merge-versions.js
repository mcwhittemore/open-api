module.exports = function(versions){

	var versionNames = Object.keys(versions);

	var lastVersion = versions[versionNames[0]].routes;
	for(var i=1; i<versionNames.length; i++){
		var curVersion = versions[versionNames[i]].routes;

		var lastPaths = Object.keys(lastVersion);
		for(var j=0; j<lastPaths.length; j++){
			var lastPath = lastPaths[j];

			var lastRoute = lastVersion[lastPath];
			var curRoute = curVersion[lastPath] || {};

			var lastMethods = Object.keys(lastRoute);

			for(var k=0; k<lastMethods.length; k++){
				var lastMethod = lastMethods[k];
				if(curRoute[lastMethod] == undefined){
					curRoute[lastMethod] = lastRoute[lastMethod];
				}
			}

			curVersion[lastPath] = curRoute;
		}

		lastVersion = curVersion;
	}
}