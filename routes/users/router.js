'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const passport = require("passport");

const {Users} = require('./models');

const router = express.Router();

const jsonParser = bodyParser.json();

const jwtAuth = passport.authenticate("jwt", { session: false });

function checkPostReq(req,res,next){
  // check requiredFields exist. (user's registration form may contain several fields, and only certain fields are definitely required)
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

  // check certain fields have the right type (in front-end, ensure to have password type as string instead of number)
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

  // If the username and password aren't trimmed we give an error.  Users might expect that these will work without trimming (i.e. they want the password "foobar ", including the space at the end).  We need to reject such values explicitly so the users know what's happening, rather than silently trimming them and expecting the user to understand. We'll silently trim the other fields, because they aren't credentials used to log in, so it's less of a problem.
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
      // Forward validation errors on to the client, otherwise give a 500 error because something unexpected has happened
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({ code: 500, message: "Internal server error" });
    });
});
//change before release
router.get("/:id", jwtAuth, (req, res) => {
  Users.findById(req.params.id)
    .populate("portfolio")
    .exec(function(err, user) {
      if (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
      }
      res.status(200).json(user.serialize());
    });
});
//Remove before production
router.get("/", (req, res) => {
  return Users.find()
    .then(users => res.json(users.map(user => user.serialize())))
    .catch(err => res.status(500).json({ message: "Internal server error" }));
});

module.exports = {router};