"use strict";
const { Strategy: LocalStrategy } = require("passport-local");

const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");

const { Users } = require("../users/newmodels");
const { JWT_SECRET } = require("../../config");

const localStrategy = new LocalStrategy(
  {
    usernameField: "username",
    session: false
  },
  (username, password, callback) => {
    let user;
    Users.findOne({ username: username })
      .then(_user => {
        user = _user;
        if (!user) {
          return Promise.reject({
            reason: "LoginError",
            message: "Incorrect username or password"
          });
        }
        return user.validatePassword(password);
      })
      .then(isValid => {
        if (!isValid) {
          return Promise.reject({
            reason: "LoginError",
            message: "Incorrect username or password"
          });
        }
        return callback(null, user);
      })
      .catch(err => {
        if (err.reason === "LoginError") {
          return callback(null, false, err);
        }
        return callback(err, false);
        
      });
  }
);

const jwtStrategy = new JwtStrategy(
  {
    secretOrKey: JWT_SECRET,
    // Look for the JWT as a Bearer auth header
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("Bearer"),
    // Only allow HS256 tokens 
    algorithms: ["HS256"]
  },
  (payload, done) => {
    done(null, payload.user);
  }
);

module.exports = { localStrategy, jwtStrategy };