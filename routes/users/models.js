'use strict';

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    //change before production to different ref
    portfolio: [{ type: mongoose.Schema.Types.ObjectId, ref: "cardlist" }]
});
//display user account info, doesn't store password
userSchema.methods.serialize = function() {
    return {
        username: this.username || '',
        id: this._id,
        cardlists:this.cardlists
    };
};

userSchema.methods.validatePassword = function(password) {
    return bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = function(password) {
    return bcrypt.hash(password, 10);
};
//users collection in db
const Users = mongoose.model('users', userSchema);

module.exports = {Users};