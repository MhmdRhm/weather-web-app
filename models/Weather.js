const mongoose = require("mongoose");

const weatherSchema = mongoose.Schema({
    city: { type: mongoose.Schema.Types.ObjectId, ref: "City", require },
    temp: {
        type: mongoose.Decimal128,
        required: true
    },
    humidity: {
        type: Number,
        required: true
    },
    windSpeed: {
        type: mongoose.Decimal128,
        required: true,
    },
    description: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('Weather', weatherSchema);