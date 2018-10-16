"use strict";

const mongoose = require("mongoose");

const { Users } = require("../users/models");

const listSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  name: { type: String, required: true },
  symbol: {type: String, required: true}
});

// listSchema.pre("findOne", function(next) {
//   this.populate("creator");
//   next();
// });

// listSchema.pre("find", function(next) {
//   this.populate("creator");
//   next();
// });

// listSchema.pre("save", function(next) {
//   User.findById(this.creator).exec((error, user) => {
//     user.cardlists.push(this);
//     user.save(() => {
//       next();
//     });
//   });
// });

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

const cardList = mongoose.model("cardlist", listSchema);

module.exports = { cardList };