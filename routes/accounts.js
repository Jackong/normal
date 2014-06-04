/**
 * Created by daisy on 14-5-30.
 */

var User = require('../model/User');
var logger = require('../common/logger');
var message = require('bae-message');
var msgConfig = require('../common/config')('message');

module.exports = function (router) {
    router.route('/accounts')
        .post(router.checker.body('account', 'password'))
        .post(function register(req, res) {
            var user = new User({account: req.body.account, password: req.body.password});
            user.save(function (err) {
                if (null !== err) {
                    logger.error('create account', req.body.account, err.message);
                    return res.fail();
                }
                User.login(req.body.account, req, res);
                res.ok();
            });
        });

    router.route('/accounts')
        .put(router.checker.body('oldPassword'))
        .put(router.checker.body('password'))
        .put(function updatePassword(req, res) {
            var account = User.getAccount(req, res);
            if (!account) {
                return res.fail('登录状态已经过期', res.CODE.UN_LOGIN);
            }
            User.update({account: account, password: req.body.oldPassword }, {password: req.body.password}, function (err, num) {
                if (null !== err) {
                    logger.error('update password', account, num, err.message);
                    return res.fail('修改密码失败，请重试');
                }
                if (1 === num) {
                    return res.ok();
                }
                logger.error('update password', account, num);
                return res.fail('原密码错误');
            });
        });

    router.route('/accounts/:account')
        .get(router.checker.params('account'))
        .get(router.checker.query('password'))
        .get(function login(req, res) {
            User.findOne({account: req.params.account}, 'password', {lean: true}, function (err, account) {
                if (null === account || req.query.password !== account.password) {
                    logger.error('login', account);
                    return res.fail();
                }
                User.login(req.params.account, req, res);
                return res.ok();
            });
        });

    router.route('accounts')
        .get(function checkLogin(req, res) {
            var account = User.getAccount(req, res);
            if (null === account) {
                return res.fail();
            }
            return res.ok();
        });
    
    router.route('/accounts/forgotSign/:account')
        .get(router.checker.params('account'))
        .get(function forget(req, res) {
            var sign = User.forgotSign(req.params.account);
            var url = req.protocol + '://' + req.host
                + '/account/canReset/' + req.params.account + '?sign=' + sign;
            var bae = new message({
                key: msgConfig.key,
                secret: msgConfig.secret,
                queue: msgConfig.queue
            });
            bae.mail('no-reply', req.params.account, '密码找回【iWomen】', '<!--HTML--><a href="' + url + '">点击找回密码（请匆回复）</a>');
            res.ok();
        });

    router.route('/accounts/canReset/:account')
        .put(router.checker.params('account'))
        .put(router.checker.body('password'))
        .put(router.checker.body('sign'))
        .put(function reset(req, res) {
            var canReset = User.canReset(req.params.account, req.body.sign);
            if (!canReset) {
                return res.fail('链接无效或已过期');
            }
            User.update({account: req.params.account }, {password: req.body.password}, function (err, num) {
                if (null !== err) {
                    logger.error('update password', account, num, err.message);
                    return res.fail('修改密码失败，请重试');
                }
                if (1 === num) {
                    return res.ok();
                }
                logger.error('update password', account, num);
                return res.fail('原密码错误');
            });
        })

};