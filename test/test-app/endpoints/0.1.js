module.exports = function(ver) {

    ver.addValidator("user", "The available details of a user", function(value) {
        if (typeof value.id != "number") {
            return false;
        } else if (typeof value.name == undefined) {
            return false;
        } else {
            return true;
        }
    });

    ver.addValidator("user-list", "A List of User Objects", function(value) {
        var userValidator = ver.getValidator("user");

        if (Object.prototype.toString.call(value) === '[object Array]') {
            for (var i = 0; i < value.length; i++) {
                if (!userValidator(value[i])) {
                    return false;
                }
            }
            return true;
        } else {
            return false;
        }

    });

    ver.get("users", {
        validate: {
            request: "empty-body",
            response: "user-list",
        },
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