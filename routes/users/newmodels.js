'use strict';

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');


const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});
//display user account info, doesn't store password
userSchema.methods.serialize = function() {
    return {
        username: this.username,
        id: this._id,
    };
};

userSchema.methods.validatePassword = function(password) {
    return bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = function(password) {
    return bcrypt.hash(password, 10);
};
//Users collection in db
const Users = mongoose.model('Users', userSchema);

module.exports = {Users};