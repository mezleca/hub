const express = require("express")
const router = express.Router();
const webtoken = require("jsonwebtoken");

const { get_data, check_data, MY_SECRET } = require("../config.js");
const { Image } = require("../models/Post.js");
const { check_token } = require("./middlewares/check_token.js");

router.get("/", check_token, async (req, res) => {
    try {
        const image = await Image.find();
        res.render("index.ejs", { images: get_data(image), user: { name: req.user.name } });
    } catch(err) {
        console.log(err);
        res.send("ocorreu um erro");
        await check_data();
    }
});

router.get("/media", async (req, res) => {
    res.redirect("/");
});

router.get("/upload", check_token, async (req, res) => {
    res.render("upload.ejs", { user: { name: req.user.name } });
});

router.get("/search", check_token, async (req, res) => {
    try {    
        res.render("search.ejs", { user: { name: req.user.name } });
    } catch(err) {
        console.log(err);
        res.send("ocorreu um erro");
    }
});

router.get("/media/:id", check_token, async (req, res) => {
    try {
        const image = await Image.find({_id: req.params.id});
        res.render("post.ejs", { image: get_data(image), user: { name: req.user.name } });
    } catch(err) {
        res.send("ocorreu um erro, tente recarregar a pagina");
        await check_data();
    }
});

module.exports = router;