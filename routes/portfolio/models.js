"use strict";

const mongoose = require("mongoose");

const { Users } = require("../users/models");
//Users schema/model Users called
const listSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  name: { type: String, required: true },
  symbol: {type: String, required: true}
});

listSchema.virtual("user_id").get(function() {
  return `${this.user._id}`.trim();
});

listSchema.methods.serialize = function() {
  return {
    id: this._id,
    user: this.user_id,
    name: this.name,
    symbol: this.symbol
  };
};
//portfolio collection in mlab database

const portfolio = mongoose.model("portfolio", listSchema);

module.exports = { portfolio };