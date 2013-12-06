var uuid = require("uuid");

module.exports = function(request, response, doTrack) {

    doTrack = doTrack || function(req) {
        //track urls that DONT match "/" or "/docs"
        return req.url.match(/^\/$|^\/docs/) == null;
    }

    return function(req, res, next) {
        res.loadSize = 0;
        var end = res.end;
        res.end = function() {
            end.apply(res, arguments);
            if (doTrack(req)) {
                //TRACK RESPONSE
                response(req, res);
            }
        }

        if (doTrack(req)) {
            //TRACK REQUEST
            req.trackId = uuid.v4();
            request(req, res);
        }

        next();
    }
}