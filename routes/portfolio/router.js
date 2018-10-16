"use strict";
const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const config = require("../../config");
const router = express.Router();

const { portfolio } = require("./models");
const { Users } = require("../users/models");

const jsonParser = bodyParser.json();

const jwtAuth = passport.authenticate("jwt", { session: false });

//GET request to /portfolio => return all lists
router.get("/", (req, res) => {
    portfolio
      .find()
      .populate("user")
      .exec(function(err, portfolio) {
        if (err) {
          console.error(err);
          res.status(500).json({ message: "Internal server error" });
        }
        res.status(200).json(
          portfolio.map(portfolio => {
            return {
              id: portfolio._id,
              user: portfolio.user.serialize(),
              name: portfolio.name,
              symbol: portfolio.symbol
            };
          })
        );
      });
  });

//GET request to return card lists by ID
router.get("/:id", jwtAuth, (req, res) => {
    portfolio
      .findById(req.params.id)
      .populate("user")
      .exec(function(err, portfolio) {
        if (err) {
          console.error(err);
          res.status(500).json({ message: "Internal server error" });
        }
        res.status(200).json(portfolio.serialize());
      });
  });
//POST request to add lists
//Check to see if lists are filled.
router.post("/", jsonParser, jwtAuth, async (req, res) => {
    const requiredFields = [
      "name",
      "symbol"
    ];
    for (let i = 0; i < requiredFields.length; i++) {
      const field = requiredFields[i];
      if (!(field in req.body)) {
        const message = `Missing \`${field}\` in request body`;
        console.log(message);
        return res.status(400).send(message);
      }
    }
  
    try {
      let user = await Users.findById(req.user.id);
      if (user) {
        try {
          let createdPortfolio = await portfolio.create({
            name: req.body.name,
            user: req.user.id,
            symbol: req.body.symbol
          });
          user.portfolio.push(createdPortfolio);
          user.save();
  
          res.status(201).json({
            id: createdPortfolio.id,
            user: user.id,
            name: createdPortfolio.name,
            symbol: createdPortfolio.symbol,
          });
        } catch (err) {
          console.log(err);
          res.status(500).json({ message: "Internal Server Error" });
        }
      } else {
        const message = "User not found";
        console.error(message);
        return res.status(400).send(message);
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  router.put("/:id", jsonParser, jwtAuth, (req, res) => {
    if (!(req.params.id === req.body.id)) {
      const message =
        `Request path id (${req.params.id}) and request body id ` +
        `(${req.body.id}) must match`;
  
      console.error(message);
      return res.status(400).json({ message: message });
    }
  
    //Not Working
  
    if (!(req.user.id === req.body.user)) {
      const message =
        `Request user id (${req.user.id}) and request cardlist id ` +
        `(${req.body.user}) must match`;
  
      console.error(message);
      return res.status(400).json({ message: message });
    }
  
    console.log(`Updating Portfolio item \`${req.params.id}\``);
    const updatedPortfolio = {};
    const updateableFields = [
      "name"
    ];
  
    updateableFields.forEach(field => {
      if (field in req.body) {
        updatedPortfolio[field] = req.body[field];
      }
    });
  
    portfolio
      .findByIdAndUpdate(req.params.id, { $set: updatedPortfolio }, { new: true })
      .then(updatedPortfolio =>
        res.status(204).json({
          id: updatedPortfolio.id,
          user: updatedPortfolio.user,
          name: updatedPortfolio.name,
          symbol: updatedPortfolio.symbol,
        })
      )
      .catch(err => res.status(500).json({ message: "Internal Server Error" }));
  });

  router.delete("/:id", jwtAuth, (req, res) => {
    portfolio
      .findByIdAndRemove(req.params.id)
      .then(() => res.status(204).end())
      .catch(err => res.status(500).json({ message: "Internal Server Error" }));
  });
  
  //Error if user tries wrong endpoints
  router.use("*", function(req, res) {
    res.status(404).json({ message: "Not Found" });
  });
  
  module.exports = { router };