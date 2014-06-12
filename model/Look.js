/**
 * Created by daisy on 14-6-4.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Favorite = require('./Favorite');
var TagLook = require('./tag/Look');
var TagFollower = require('./tag/Follower');
var UserPublication = require('./user/Publication');
var UserWant = require('./user/Want');
var UserFollower = require('./user/Follower');
var UserFeed = require('./user/Feed');

var logger = require('../common/logger');

var Look = Schema({
    _id: String,//文件MD5
    publisher: Schema.Types.ObjectId,//User:发布者
    image: String,//图片
    isValid: {type: Boolean, default: true},
    tags: [{type: String, lowercase: true, trim: true}],//标签
    description: String,//描述
    created: {type: Date, default: Date.now},
    updated: {type: Date, default: Date.now},
    likes: [{ type: Schema.Types.ObjectId }],//User:喜欢的人
    favorites: [{type: Schema.Types.ObjectId}]//Favorite:心仪的东西
});

Look.virtual('aspect');

Look.pre('save', function saveFavorite(next) {
    var favorite = new Favorite({aspect: this.aspect, wants:[this.publisher]});
    var favorites = this.favorites;
    favorite.save(function (err, doc) {
        if (null !== err) {
            logger.error('saving favorite:', err.message, this);
        }
        favorites[0] = doc._id;
        next();
    });
});


Look.post('save', function syncTag(doc) {
    for(var idx = 0; idx <= doc.tags.length; idx++) {
        TagLook.update(
            {
                _id: doc.tags[idx]
            },
            {
                $addToSet:
                {
                    looks: doc._id
                }
            },
            {
                upsert: true
            }
        ).exec();
    }
});

Look.post('save', function syncPublication(doc) {
    UserPublication.update(
        {
            _id: doc.publisher
        },
        {
            $addToSet:
            {
                publications: doc._id
            }
        },
        {
            upsert: true
        }
    ).exec();
});

Look.post('save', function syncWant(doc) {
    UserWant.update(
        {
            _id: doc.publisher
        },
        {
            $addToSet:
            {
                wants: doc._id
            }
        },
        {
            upsert: true
        }
    ).exec();
});

Look.post('save', function syncFeed(doc) {
    UserFollower.findById(doc.publisher, function (err, userFollower) {
        if (null !== err || null === userFollower) {
            return;
        }
        var followers = userFollower.followers;
        for(var idx = 0; idx < followers.length; idx++) {
            UserFeed.update(
                {
                    _id: followers[idx]
                },
                {
                    $addToSet: {
                        feeds: doc._id
                    }
                },
                {
                    upsert: true
                }
            ).exec();
        }
    });

    var tags = doc.tags;
    for(var idx = 0; idx < tags.length; idx++) {
        TagFollower.findById(tags[idx], function (err, tagFollower) {
            if (null !== err || null === tagFollower) {
                return;
            }
            var followers = tagFollower.followers;
            for (var jdx = 0; jdx < followers.length; jdx++) {
                UserFeed.update(
                    {
                        _id: followers[jdx]
                    },
                    {
                        $addToSet: {
                            feeds: doc._id
                        }
                    },
                    {
                        upsert: true
                    }
                ).exec();
            }
        });
    }
});



module.exports = mongoose.model('Look', Look);