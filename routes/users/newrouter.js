'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const passport = require("passport");

const {Users} = require('./newmodels');
const jwt = require('jsonwebtoken');
const {JWT_SECRET, JWT_EXPIRY}= require('../../config');
const jwtAuth = passport.authenticate('jwt', { session: false, failureRedirect: '/auth/login' });
const router = express.Router();

const jsonParser = bodyParser.json();

const localAuth = passport.authenticate("jwt", { session: false });

function checkPostReq(req,res,next){
  // check for requiredFields 
  const requiredFields = ['username', 'password'];
  const missingField = requiredFields.find(field => !(field in req.body));
  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
  }

  // make sure password has string
  const stringFields = ['username', 'password'];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  );
  if (nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Incorrect field type: expected string',
      location: nonStringField
    });
  }

  // error if username/password aren't trimmed
  const explicityTrimmedFields = ['username', 'password'];
  const nonTrimmedField = explicityTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );
  if (nonTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Cannot start or end with whitespace',
      location: nonTrimmedField
    });
  }

  // check size of certain fields are valid
  const sizedFields = {
    username: {
      min: 3
    },
    password: {
      min: 4,
      //bcrypt will only allow 72 characters of security
      max: 72
    }
  };
  const tooSmallField = Object.keys(sizedFields).find(
    field =>
      'min' in sizedFields[field] &&
            req.body[field].trim().length < sizedFields[field].min
  );
  const tooLargeField = Object.keys(sizedFields).find(
    field =>
      'max' in sizedFields[field] &&
            req.body[field].trim().length > sizedFields[field].max
  );
  if (tooSmallField || tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: tooSmallField
        ? `Must be at least ${sizedFields[tooSmallField]
          .min} characters long`
        : `Must be at most ${sizedFields[tooLargeField]
          .max} characters long`,
      location: tooSmallField || tooLargeField
    });
  }

  next();
}

//create post endpoint to register a new user

router.post('/', jsonParser, checkPostReq, (req, res) => {
  let {username, password} = req.body;

  // check if conflicts database and create an account if no conflict
  return Users.find({username})
    .count()
    .then(count => {
      if (count > 0) {
        // There is an existing user with the same username
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'Username already taken',
          location: 'username'
        });
      }
      // If there is no existing user, hash the password using the instance method
      // in models.js
      return Users.hashPassword(password);
    })
    .then(hash => {
      return Users.create({
        username,
        password: hash
      });
    })
    .then(user => {
      return res.status(201).json(user.serialize());
    })
    .catch(err => {
      // Forward validation errors on to the client, otherwise give a 500 error 
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({ code: 500, message: "Internal server error" });
    });
});

router.get('/checkuser', jwtAuth, (req, res) => {
    return Users.findOne({ username: req.user.username })
      .then(doc => {
        res.json(doc.serialize())
      })
      .catch(err => {
        res.status(500).end('Something went wrong')
      })
})
  
module.exports = {router};