module.exports = function(ver) {

    ver.get("test/:id", {
        discontinued: true
    });

    ver.post("users", {
        request: "empty",
        response: "object",
        desc: "Create a new user"
    }, function(req, res) {
        res.json({
            id: 3,
            name: req.body.name
        });
    });

    ver.get("users/:id", {
        request: "empty",
        response: "object",
        desc: "Get info about a single user"
    }, function(req, res) {
        res.json({
            id: req.params.id,
            name: "x"
        });
    });

    ver.post("users/:id", {
        request: "empty",
        response: "object",
        desc: "Update a user"
    }, function(req, res) {
        res.json({
            id: req.params.id,
            name: req.body.name
        });
    });

}