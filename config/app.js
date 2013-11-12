/* global require, process, console, module, __filename */

/**
 *  Creates the express app and configure static folders
 */

var express = require('express');
var env = require('./env');
var redis = require('./redisclient');
var nunjucks = require('nunjucks');
var fs = require('fs');

var app = express(),
    oneDay = 86400000;

app.use(express.compress(), {
    maxAge: oneDay
});
app.locals.assetsURL = env.assetsURL;
app.set('views', env.views);
app.set('redis', redis);
app.engine('html', nunjucks.render);
app.use(app.locals.assetsURL, express.static(env.assetsPath));
app.use(express.logger());

nunjucks.configure(env.views, {
    autoescape: true,
    express: app
});

app.listen(env.port, function(err) {
    if (err) {
        console.error(err); process.exit(-1);
    }

    // if run as root, downgrade to the owner of this file
    if (process.platform.toLowerCase().indexOf('win') === -1) {
        if ( process.getuid() === 0 ) {
            fs.stat(__filename, function(err, stats) {
                if (err) {
                    return console.error(err);
                }
                process.setuid(stats.uid);
            });
        }
    }
    console.log('%s: Node server started on http://0.0.0.0:%d ...',
                Date(Date.now() ), env.port);
});

module.exports = app;
