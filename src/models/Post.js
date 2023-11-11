const mongoose = require("mongoose");

const Image = mongoose.model("Media", {
    name: String,
    data: String,
    original_name: String,
    preview_name: String,
    preview: String,
    duration: String,
    likes: Number,
    date: String,
    user: String,
    format: String,
});

module.exports = {
    Image
};