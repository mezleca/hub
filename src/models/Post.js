const mongoose = require("mongoose");

const Image = mongoose.model("Media", {
    name: String,
    data: String,
    preview: String,
    date: String,
    user: String,
    format: String,
});

module.exports = {
    Image
};