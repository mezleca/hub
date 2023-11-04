const express = require("express")
const router = express.Router();

const { get_data, check_data } = require("../config.js");
const { Image } = require("../models/Post.js");

router.get("/", (req, res) => {
    res.render("index.ejs");
});

router.get("/media", async (req, res) => {
    try {
        const images = await Image.find();
        res.render("media.ejs", { images: get_data(images) });
    } catch(err) {
        res.send("ocorreu um erro, tente recarregar a pagina");
        await check_data();
    }
});

router.get("/search", async (req, res) => {
    try {
        res.render("search.ejs");
    } catch(err) {
        console.log(err);
        res.send("ocorreu um erro");
    }
});

router.get("/media/:id", async (req, res) => {
    try {
        const image = await Image.find({_id: req.params.id});
        res.render("post.ejs", { image: get_data(image) });
    } catch(err) {
        res.send("ocorreu um erro, tente recarregar a pagina");
        await check_data();
    }
});

module.exports = router;