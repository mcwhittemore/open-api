//https://github.com/visionmedia/express/blob/master/lib/response.js
module.exports = function(req, res, next) {
    res.json = function(obj) {
        // allow status / body
        if (2 == arguments.length) {
            // res.json(body, status) backwards compat
            if ('number' == typeof arguments[1]) {
                this.statusCode = arguments[1];
            } else {
                this.statusCode = obj;
                obj = arguments[1];
            }
        }

        // settings
        var body = JSON.stringify(obj, null, 2);

        // content-type
        this.charset = this.charset || 'utf-8';
        this.getHeader('Content-Type') || this.setHeader('Content-Type', 'application/json');

        return this.end(body);
    }

    next();
}