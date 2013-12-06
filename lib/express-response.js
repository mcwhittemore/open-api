//https://github.com/visionmedia/express/blob/55d1a4f96463c114bb13d9dcc9fa1866ef6eb0b0/lib/response.js
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

        if (res.loadSize == undefined) {
            res.loadSize = 0;
        }

        res.loadSize += body.length;

        return this.end(body);
    }

    next();
}