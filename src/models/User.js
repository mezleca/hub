const mongoose = require("mongoose");

const User = mongoose.model("HUB-User", {
    user: String,
    email: String,
    pass: String,
});

module.exports = {
    User
};