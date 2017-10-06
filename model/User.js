'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let UserSchema = new Schema({
    displayName: String,
    userIds: String,
    pictureUrl: String,
    statusMessage: String,
    namaToko: String,
    kode: String
}, { timestamps: true }, { collection: 'user' });

module.exports = mongoose.model('user', UserSchema);