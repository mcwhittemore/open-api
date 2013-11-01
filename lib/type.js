module.exports = function(desc, example, validator) {
    //desc: for the docs
    //example: for the docs. If this is a file, it will be read in.
    //validator: a function that takes in a value and returns true or false
    var type = {};
    type.desc = desc;
    type.example = example;
    type.isValid = validator;

    return type;
}