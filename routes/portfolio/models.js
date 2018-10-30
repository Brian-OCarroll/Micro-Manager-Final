"use strict";

const mongoose = require("mongoose");

const { Users } = require("../users/newmodels");
//Users schema/model referenced by obj id
const listSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Users",},
  name: { type: String, required: true,},
  description: {type:String, required: true},
  image: {type:String},
  symbol: {type: String, required: true}
});

listSchema.virtual("user_id").get(function() {
  return `${this.user._id}`.trim();
});

listSchema.methods.serialize = function() {
  return {
    id: this._id,
    name: this.name,
    image: this.image,
    description: this.description,
    symbol: this.symbol
  };
};
//portfolio collection in mlab database

const portfolio = mongoose.model("portfolio", listSchema);

module.exports = { portfolio };