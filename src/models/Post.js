const mongoose = require("mongoose");

const Image = mongoose.model("Image", {
    name: String,
    path: String,
    date: String,
    user: String,
    format: String
});

module.exports = {
    Image
};