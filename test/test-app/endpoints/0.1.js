module.exports = function(ver) {

    ver.get("test/:id", {
        request: "empty",
        response: "object",
        desc: "just a test with an id"
    }, function(req, res) {
        res.json(req.params);
    });

    ver.get("users", {
        request: "empty",
        response: "object",
        desc: "List our all users"
    }, function(req, res) {
        res.json([{
            id: 1,
            name: "a"
        }, {
            id: 2,
            name: "b"
        }]);
    });

}