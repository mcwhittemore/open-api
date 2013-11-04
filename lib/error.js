require("colors");
module.exports = function(message, stackNumber) {
    try {
        throw new Error(message);
    } catch (err) {
        if (err.stack) {
            var parts = err.stack.split("\n");
            if (parts[stackNumber]) {
                var addon = parts[stackNumber].split("(")[1].split(")")[0];
                throw new Error(err.message + " from " + addon.yellow);
            }
        }
        throw err;
    }
}