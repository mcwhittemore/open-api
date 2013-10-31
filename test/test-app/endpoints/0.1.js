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

}