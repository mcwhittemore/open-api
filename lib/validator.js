module.exports = function(requestType, responseType, controller) {
    return function(req, res, next) {
        //TODO: validate request
        controller(req, res, next);
        //TODO: find a good ways to also validate response
    }
}

module.exports.discontinued = function(req, res) {
    res.json(410, {
        "error": "This endpoint has been discontinued"
    });
}