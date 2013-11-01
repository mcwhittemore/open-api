var type = require("./type");
module.exports = {
    "empty": type("empty", "An object with no params", {}, function(value) {
        return Object.getOwnPropertyNames(value).length == 0;
    }),
    "object": type("object", "Any object of any complexity. Not an array. Not a number. Not a string", {
        "foo": "bar"
    }, function(value) {
        //TODO: make this work
        return false;
    }),
    "required": type("required", "Anything that does not evaluate to undefined", !undefined, function(value) {
        return typeof value != "undefined";
    })
}