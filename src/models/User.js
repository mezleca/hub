const mongoose = require("mongoose");

const User = mongoose.model("HUB-User", {
    user: String,
    email: String,
    pass: String,
    pfp: String,
    desc: String, 
    posts: Array
});

module.exports = {
    User
};