const mongoose = require("mongoose");

const forecastSchema = new mongoose.Schema({
    city: { type: mongoose.Types.ObjectId, ref: "City" },
    eveningTemp: {
        type: mongoose.Decimal128,
        required: true
    },
    morningTemp: {
        type: mongoose.Decimal128,
        required: true
    },
    nightTemp: {
        type: mongoose.Decimal128,
        required: true
    },
});

module.exports = mongoose.model('Forecast', forecastSchema);