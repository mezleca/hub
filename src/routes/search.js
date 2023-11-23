const express = require("express")
const router = express.Router();

const { Image } = require("../models/Post.js");
const { User } = require("../models/User.js");

router.get("/:name", async (req, res) => {
    try {
        const regex = new RegExp(req.params.name, "i");

        const posts_result = await Image.find({ name: regex }).select("-data -__v");
        const user_result = await User.find({ user: regex }).select("-__v");
        const user = await User.findOne({ user: req.user.name });
        user.name = req.user.name;

        res.render("search.ejs", { media: posts_result || [], user: user, users: user_result || [] });
    } catch(err) {
        console.log(err);
        res.status(401).send("ocorreu um erro");
    }
});

module.exports = router;