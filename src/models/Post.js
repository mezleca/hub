const mongoose = require("mongoose");

const Image = mongoose.model("Image", {
    name: String,
    data: String,
    date: String,
    country: String,
    format: String
});

module.exports = {
    Image
};