const mongoose = require("mongoose")

const {
    Schema,
} = mongoose.Schema

const StockSchema = new mongoose.Schema({
    stock: {
        type: String,
        required: true
    },
    ip: {
        type: [String],
        unique: true
    }
})

module.exports = mongoose.model('Stock', StockSchema)