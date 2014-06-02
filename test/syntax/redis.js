/**
 * Created by daisy on 14-6-2.
 */

require('should');
var redis = require('../../common/redis');

describe('redis', function () {
    it('should be set and get', function (done) {
        redis.set('jack', 'ok');
        redis.get('jack', function (err, result) {
            (null === err).should.be.true;
            result.should.be.equal('ok');
            done();
        });
    });
    it('should be has ttl after setting expire', function (done) {
        redis.setex('exp_test', 100, 'value', function (err, result) {
            (null === err).should.be.true;
            result.should.be.equal('OK');
            done();
        });

    });
    afterEach(function () {
        redis.del('jack');
    })
});