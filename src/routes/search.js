const express = require("express")
const router = express.Router();

const { Image } = require("../models/Post.js");
const { User } = require("../models/User.js");

router.get("/:name", async (req, res) => {
    try {
        const regex = new RegExp(req.params.name, "i");

        const posts_result = await Image.find({ name: regex }).select("-data -__v");
        const user_result = await User.find({ user: regex }).select("-__v");

        console.log(posts_result, user_result);

        res.render("search.ejs", { media: posts_result || [], user: { name: req.user.name }, users: user_result || [] });
    } catch(err) {
        console.log(err);
        res.status(401).send("ocorreu um erro");
    }
});

module.exports = router;