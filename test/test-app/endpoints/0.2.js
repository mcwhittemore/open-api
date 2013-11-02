module.exports = function(ver) {

    ver.get("test/:id", {
        request: "empty",
        response: "object",
        desc: "just a test with an id"
    }, function(req, res) {
        res.json(req.params);
    });

}