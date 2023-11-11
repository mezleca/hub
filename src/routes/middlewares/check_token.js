const { MY_SECRET } = require("../../utils/config/config.js");
const webtoken = require("jsonwebtoken");

const check_token = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect("/");
    }
    
    try {
        webtoken.verify(token, MY_SECRET);
        next();
    }
    catch (error) {
        return res.redirect("/");
    }
};

module.exports = { check_token };