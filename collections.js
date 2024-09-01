const express     = require('express');
const mongoose = require('mongoose');
require('./dbConnect');

const { Schema } = mongoose;
const StockSchema = new Schema({
    "symbol": {type: String, required: true},
    "likes": {type: [String], default:[]}  
});
const Stock = mongoose.model("Stock", StockSchema);
exports.Stock = Stock;