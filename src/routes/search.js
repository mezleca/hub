const express = require("express")
const router = express.Router();

const { Image } = require("../models/Post.js");

router.get("/:name", async (req, res) => {
    try {
        const regex = new RegExp(req.params.name, "i");
        const result = await Image.find({ name: regex }).select("-data -__v");
        res.render("search.ejs", { image: result || [], user: { name: req.user.name } });
    } catch(err) {
        console.log(err);
        res.status(401).send("ocorreu um erro");
    }
});

module.exports = router;