/**
 * Created by daisy on 14-6-15.
 */

var async = require('async');

var logger = require('../common/logger');
var helper = require('../common/helper');
var Look = require('../model/Look');
var Tag = require('../model/Tag');
var UserPublish = require('../model/user/Publish');
var UserWant = require('../model/user/Want');
var UserLike = require('../model/user/Like');
var UserTip = require('../model/user/Tip');
var Tip = require('../model/Tip');
var User = require('../model/User');
var Favorite = require('../model/Favorite');

module.exports = {
    firstPublish: function (look, callback) {
        async.parallel({
            look: function(callback) {
                look.save(callback);
            },
            favorite: function(callback) {
                Favorite.sync(look.publisher, look._id, look.favorites[0], callback)
            },
            tags: function(callback) {
                Tag.putNewLook(look.tags, look._id, callback);
            },
            publish: function(callback) {
                UserPublish.putNewLook(look.publisher, look._id, callback);
            },
            want: function(callback) {
                UserWant.putNewLook(look.publisher, look._id, callback);
            }
        }, function (err, results) {
            var doc = look.toObject();
            doc.likeCount = 0;//todo
            doc.favorites = [{_id: doc.favorites[0], wants: [], tips: []}];
            callback(err, doc);
        });
    },
    republish: function (old, look, callback) {
        async.parallel({
            syncWant: function syncWant(callback) {
                if (look.publisher === old.publisher) {
                    return callback(null, null);
                }
                UserWant.putNewLook(look.publisher, look._id, callback);
            },
            tags: function filterTags(callback) {
                async.filter(look.tags, function (tag, callback) {
                    callback(old.tags.indexOf(tag) < 0);
                }, function (tags) {
                    callback(null, tags);
                })
            },
            favorites: function filterFavorite(callback) {
                async.filter(look.favorites, function (favorite, callback) {
                    callback(old.favorites.indexOf(favorite) < 0);
                }, function (favorites) {
                    callback(null, favorites);
                });
            }
        }, function (err, results) {
            if (err) {
                return callback(err, null);
            }
            var tags = results.tags;
            var favorites = results.favorites;
            if (tags.length === 0 && favorites.length === 0) {
                return callback(err, old);
            }
            if (tags.length > 0) {
                Tag.putNewLook(tags, look._id, function (err) {
                    err ? logger.error('Tag.putNewLook', err) : '';
                });
            }
            if (favorites.length > 0) {
                Favorite.sync(look.publisher, look._id, favorites[0], function (err) {
                    err ? logger.error('Favorite.sync', err) : '';
                })
            }
            var now = helper.now();
            Look.appendTagsAndFavorites(look._id, tags, favorites, now,
                function (err, num) {
                    old.tags = old.tags.concat(tags);
                    old.favorites = old.favorites.concat(favorites);
                    old.likeCount = 0;//todo
                    old.updated = now;
                    if (null !== err || num !== 1) {
                        old = null;
                    }
                    callback(err, old);
                }
            )
        })
    },
    publish: function (look, callback) {
        var self = this;
        Look.findById(look._id,
            {
                publisher: 1,
                image: 1,
                tags: 1,
                description: 1,
                created: 1,
                favorites: 1
            },
            {
                lean: true
            }, function (err, doc) {
            if (doc !== null) {
                return self.republish(doc, look, callback);
            }
            return self.firstPublish(look, callback);
        });
    },
    getTrend: function (start, num, callback) {
        Look.getTrend(parseInt(start), parseInt(num), function (err, looks) {
            if (null !== err || looks.length <= 0) {
                return callback(err, looks);
            }
            async.waterfall([
                function makePublisherIds(callback) {
                    async.map(looks, function (look, callback) {
                        callback(null, look.publisher);
                    }, callback);
                },
                function makePublisherMap(publisherIds, callback) {
                    User.perfect(publisherIds, callback);
                },
                function perfectDetailAndfilterNull(publisherMap, callback) {
                    async.filter(looks, function (look, callback) {
                        look.publisher = publisherMap[look.publisher];
                        look.likeCount = 0;//todo query like count map
                        callback(look.publisher);
                    }, function (looks) {
                        callback(null, looks);
                    });
                },
                function perfectFavorites(looks, callback) {
                    async.map(looks, function (look, callback) {
                        if (look.favorites.length <= 0) {
                            return callback(null, look);
                        }
                        Favorite.perfect(look._id, look.favorites, function (err, favorites) {
                            if (err) {
                                logger.error('perfect favorites', err);
                                favorites = [];
                            }
                            look.favorites = favorites;
                            callback(null, look);
                        });
                    }, callback)
                }
            ], callback);
        });
    },
    getMyWants: function (uid, start, num, callback) {
        this.getMyLooks(uid, UserWant, start, num, callback);
    },
    getMyLikes: function (uid, start, num, callback) {
        this.getMyLooks(uid, UserLike, start, num, callback);
    },
    getMyTips: function (uid, start, num, callback) {
        this.getMyLooks(uid, start, num, callback);
    },
    getMyLooks: function (uid, UserLook, start, num, callback) {
        async.waterfall([
            function (callback) {
                UserLook.gets(uid, start, num, callback);
            },
            function (userLook, callback) {
                if (null === userLook) {
                    return callback(null, []);
                }
                Look.gets(userLook.looks, callback);
            }
        ], callback)
    },
    getDetail: function (id, callback) {
        Look.getOne(id, function (err, look) {
            if (err || !look) {
                return callback(err, null);
            }
            async.parallel({
                publisher: function(callback) {
                    User.getOne(look.publisher, callback);
                },
                favorites: function (callback) {
                    if (look.favorites.length <= 0) {
                        return callback(null, []);
                    }
                    Favorite.perfect(look._id, look.favorites, function (err, favorites) {
                        if (err) {
                            logger.error('perfect favorites', err);
                            return callback(null, []);
                        }
                        var favorite2tips = {};
                        async.filter(favorites, function (favorite, callback) {
                            Tip.gets(favorite.tips, look._id, favorite.aspect, function (err, tips) {
                                if (err) {
                                    return callback(false);
                                }
                                favorite2tips[favorite.aspect] = tips;
                                callback(true);
                            })
                        }, function (favorites) {
                            if (favorites.length <= 0) {
                                return callback(null, []);
                            }
                            async.map(favorites, function (favorite, callback) {
                                favorite.tips = favorite2tips[favorite.aspect];
                                callback(null, favorite);
                            }, callback)
                        });
                    });

                }
            }, function (err, result) {
                if (err || !result.publisher) {
                    return callback(err, null);
                }
                look.likeCount = 0;//todo
                look.publisher = result.publisher;
                look.favorites = result.favorites;
                callback(err, look);
            })
        });
    },

    like: function(lookId, uid, callback) {
        async.waterfall([
            function update2Look(callback) {
                Look.like(lookId, uid, callback);
            },
            function update2user(num, callback) {
                if (num === 0) {
                    return callback(uid + ' try to update invalid look ' + lookId);
                }
                UserLike.putNewLook(uid, lookId, callback);
            }
        ], callback);
    }
};
