/**
 * Created by daisy on 14-6-9.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * user._id as _id
 */
var Want = Schema({
    ids: [{type: String}]
});

module.exports = mongoose.model('UserWant', Want);