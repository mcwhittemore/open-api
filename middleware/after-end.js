module.exports = function(run) {
    return function(req, res, next) {
        var end = res.end;
        res.end = function() {
            end.apply(res, arguments);
            run();
        }

        next();
    }
}