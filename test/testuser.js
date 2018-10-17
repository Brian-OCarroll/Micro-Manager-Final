"use strict";

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
const expect = chai.expect;
chai.use(chaiHttp);
const { app, runServer, closeServer } = require("../server");
const { Users } = require("../routes/users");

const { JWT_SECRET, TEST_DATABASE_URL } = require('../config');

function seedUserData( usernamefaker, passwordfaker) {
  return Users.hashPassword(passwordfaker)
  .then(hash => {
    return Users.create({
      username: usernamefaker,
      password: hash
    });
  })
}

function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

describe('/api/users', function() {
  const usernamefaker = faker.internet.email();
  const passwordfaker = faker.internet.password();


  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return seedUserData( usernamefaker, passwordfaker);
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });

  describe('/users', function() {
    describe('POST', function() {
      it('should reject user with missing fields', function() {
        return chai.request(app)
          .post('/users')
          .send({
            username: usernamefaker,
          
          })
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Missing field');
            expect(res.body.location).to.equal('password');
          })
      });
      it('should decline white space starting & ending fields', function() {
        return chai.request(app)
        .post('/users')
        .send({
          username: usernamefaker,
          password: `    ${faker.internet.password()}   `
        })
        .then(res => {
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('ValidationError');
          expect(res.body.message).to.equal('Cannot start or end with whitespace');
          expect(res.body.location).to.equal('password');
        });
      });
      it('should reject duplicate user names', function() {
          return chai.request(app)
          .post('/users')
          .send({
            username: usernamefaker,
            password: passwordfaker
          })
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Username already taken');
            expect(res.body.location).to.equal('username');
          })
      });
      it('should create a new user', function() {
        const newusername = faker.internet.userName();
        const newpassword = faker.internet.password();
        return chai
        .request(app)
        .post('/users')
        .send({
          username: newusername,
          password: newpassword
        })
        .then(res => {
          expect(res).to.have.status(201);
          expect(res).to.be.json;

        })

      })
    })
  })
})