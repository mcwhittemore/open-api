module.exports = function(ver) {

    ver.get("test/:id", {
        validate: {
            request: "empty-body",
            response: "empty-body",
        },
        desc: "just a test with an id"
    }, function(req, res) {
        res.json(req.params);
    });

}