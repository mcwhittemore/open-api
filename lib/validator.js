var reader = require("./reader");

module.exports = function(name, desc, isValid) {
    //desc: for the docs
    //validator: a function that takes in a value and returns true or false
    var validator = {};
    validator.name = name;
    validator.desc = typeof desc == "string" ? desc : "";
    validator.isValid = isValid;

    if (typeof desc != "string") {
        reader(desc, function(err, value) {
            validator.desc = value;
        });
    } else {
        reader.parser([validator.desc], function(err, desc) {
            validator.desc = desc;
        });
    }

    return validator;

}