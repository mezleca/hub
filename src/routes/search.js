const express = require("express")
const router = express.Router();
const webtoken = require("jsonwebtoken");

const { check_token } = require("./middlewares/check_token.js");
const { get_data, check_data, MY_SECRET } = require("../config.js");
const { Image } = require("../models/Post.js");

router.get("/:name", check_token, async (req, res) => {
    try {
        const regex = new RegExp(req.params.name, "i");
        const result = await Image.find({ name: regex });
        const media = get_data(result);
        const token = req.cookies.token;
        const user_name = webtoken.decode(token, MY_SECRET);

        res.render("search.ejs", { image: media || [], user: { name: user_name.user } });
    } catch(err) {
        console.log(err);
        res.status(401).send("ocorreu um erro");
        await check_data();
    }
});

module.exports = router;