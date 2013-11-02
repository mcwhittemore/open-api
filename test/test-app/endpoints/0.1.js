module.exports = function(ver) {

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