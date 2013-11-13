module.exports = function(stream, callback) {

    var chunks = [];

    stream.on('data', function(chunk) {
        chunks.push(chunk);
    });

    stream.on('end', function() {
        module.exports.parser(chunks, function(err, value) {
            callback(err, value);
        })
    });

}

module.exports.parser = function(chunks, callback) {
    var marked = require("marked");

    var out = "";
    for (var i = 0; i < chunks.length; i++) {
        if (typeof chunks[i] == "string") {
            out += chunks[i];
        } else {
            out += chunks[i].toString();
        }
    }
    callback(null, marked(out));
}