var path = require("path");

module.exports = function(app, data){

	app.get(data.docsPath, function(req, res){

        if (req.mimetype == "json") {
            res.json(data);
        } else {

            var layoutFile = path.join(__dirname, "../ejs/layout.ejs");
            var menuFile = path.join(__dirname, "../ejs/with-menu.ejs");
            var routeFile = path.join(__dirname, "../ejs/version.ejs");

            res.render([layoutFile, menuFile, routeFile], data);
        }
    });
}