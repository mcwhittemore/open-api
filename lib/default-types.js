var type = require("./type");
module.exports = {
    "empty": type("An object with no params", function(value) {
        return Object.getOwnPropertyNames(value).length == 0;
    }),
    "object": type("Any object of any complexity. Not an array. Not a number. Not a string", function(value) {
        //TODO: make this work
        return false;
    })
}