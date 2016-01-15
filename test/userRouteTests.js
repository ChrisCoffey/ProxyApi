"use strict";
var request = require('supertest');
var common = require('../middleware/common');

describe('users routes', function () {
  it('should return 200 on GET /users', function (done) {
    var url = 'http://localhost:3000';
    request(url)
      .get('/users')
      .set('users', 'google:112519421479101360256')
      .expect(200)
      .end(function (err) {
        if (err) return done(err);
        done();
      });
  });
});