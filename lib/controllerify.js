module.exports = function(requestType, paramsType, responseType, controller) {
  return function(req, res, next) {
    if (requestType.isValid(req, res) && paramsType.isValid(req, res)) {
      controller(req, res, next);
    } else {
      res.json({
        error: "Invalid Request Body",
        example: requestType.example
      });
    }
    //TODO: find a good ways to also validate response
  }
}

module.exports.discontinued = function(req, res) {
  res.json(410, {
    "error": "This endpoint has been discontinued"
  });
}