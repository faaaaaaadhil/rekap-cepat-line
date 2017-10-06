'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let SimiSchema = new Schema({
    userIds: String,
    jika: String,
    jawab: String
}, { timestamps: true }, { collection: 'simi' });

module.exports = mongoose.model('simi', SimiSchema);