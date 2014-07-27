var assert = require('assert');
var ef = require('errto');
var rimraf = require('rimraf');

describe('start', function () {
  before(function (done) {
    require('../lib/db/level');
    rimraf(__dirname + '/../tmp/data', done);
  });

  it('reset database', function (done) {
    process.nextTick(function () {
      assert(true);
      done();
    });
  });
});
