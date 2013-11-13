var validator = require("./validator");
module.exports = {
    "empty-body": validator("empty-body", "An object with no params", function(req, res) {
        return Object.getOwnPropertyNames(req.body).length == 0;
    }),
    "auto-pass": validator("auto-pass", "", function(req, res) {
        return true;
    })
}