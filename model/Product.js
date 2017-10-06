'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let ProductSchema = new Schema({
    displayName: String, //Tas ransel
    findName: String,
    harga: String,//Rp. 100.000
    barang: String,//9
    terjual: String, //10
    status: String //habis - masih
}, { timestamps: true }, { collection: 'product' });

module.exports = mongoose.model('product', ProductSchema);