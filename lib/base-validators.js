var validator = require("./validator");
module.exports = {
    "empty-body": validator("empty-body", "An object with no params", {}, function(value) {
        console.log("BODY", value);
        return Object.getOwnPropertyNames(value).length == 0;
    })
}