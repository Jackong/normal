/**
 * Created by daisy on 14-6-1.
 */

var config = require('./config')('mongo');
var logger = require('./logger');
var mongoose = require('mongoose');
var db = mongoose.connection;
var options = {
    db: { native_parser: true },
    server: { poolSize: config.poolSize },
    user: config.username,
    pass: config.password
};

db.open(config.host, config.name, config.port, options);

db.on('error', function (err) {
    logger.error('mongodb: connect error', err);
    db.close();
});

db.on('close', function () {
    logger.info("mongodb: connect close retry connect");
    db.open(config.host, config.name, config.port, options);
});