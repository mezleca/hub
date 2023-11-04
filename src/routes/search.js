const express = require("express")
const router = express.Router();

const { get_data, check_data } = require("../config.js");
const { Image } = require("../models/Post.js");

router.get("/", (req, res) => {
    res.render("index.ejs");
});

router.get("/:name", async (req, res) => {
    try {
        const regex = new RegExp(req.params.name, "i");
        const result = await Image.find({ name: regex });
        const media = get_data(result)
        console.log(media);
        res.render("search.ejs", { image: media || [] });
    } catch(err) {
      res.status(401).send("ocorreu um erro");
        await check_data();
    }
});

module.exports = router;