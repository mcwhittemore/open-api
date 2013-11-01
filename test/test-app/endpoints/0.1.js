module.exports = function(ver) {

    ver.get("test", {
        request: "empty",
        response: "object",
        desc: "just a test"
    }, function(req, res) {
        res.json({
            "woot": "woot"
        });
    });

    ver.get("test/:id", {
        request: "empty",
        response: "object",
        desc: "just a test with an id"
    }, function(req, res) {
        console.log("HERE WE ARE", Object.keys(res));
        res.json(req.params);
    });

}