const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    savedCities: [{ type: String }],

    username: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true,
    }

});

module.exports = mongoose.model('User', userSchema);