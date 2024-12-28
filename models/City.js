const mongoose = require("mongoose");

const citySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }
});

module.exports = mongoose.model("City", citySchema);
