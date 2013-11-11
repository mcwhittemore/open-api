module.exports = function(requestType, paramsType, responseType, controller) {
    return function(req, res, next) {
        var reqValid = requestType.isValid(req, res);
        if (reqValid === true) {
            var paramValid = paramsType.isValid(req, res);
            if (paramValid === true) {
                controller(req, res, next);
            } else {
                res.json({
                    error: "Invalid Request",
                    example: requestType.example,
                    message: paramValid || "Bad Params"
                });
            }
        } else {
            res.json({
                error: "Invalid Request",
                example: requestType.example,
                message: reqValid || "Bad Request Body"
            });
        }
    }
}

module.exports.discontinued = function(req, res) {
    res.json(410, {
        "error": "This endpoint has been discontinued"
    });
}