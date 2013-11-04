module.exports = function(name, desc, example, isValid) {
    //desc: for the docs
    //example: for the docs. If this is a file, it will be read in.
    //validator: a function that takes in a value and returns true or false
    var validator = {};
    validator.name = name;
    validator.desc = desc;
    validator.example = example;
    validator.isValid = isValid;

    return validator;

}