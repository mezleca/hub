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

        res.render("search.ejs", { image: get_data(result) || [], user: { name: req.user.name } });
    } catch(err) {
        console.log(err);
        res.status(401).send("ocorreu um erro");
        await check_data();
    }
});

module.exports = router;