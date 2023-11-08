const express = require("express")
const router = express.Router();

const { Image } = require("../models/Post.js");

router.get("/", async (req, res) => {
    try {
        const image = await Image.find().select("-data");
        res.render("media.ejs", { images: image, user: { name: req.user.name } });
    } catch(err) {
        console.log(err);
        res.send("ocorreu um erro");
    }
});

router.get("/upload", async (req, res) => {
    res.render("upload.ejs", { user: { name: req.user.name } });
});

router.get("/post/:id", async (req, res) => {
    try {
        const image = await Image.findOne({_id: req.params.id}).select("-preview -__v");
        res.render("post.ejs", { image: image, user: { name: req.user.name } });
    } catch(err) {
        res.send("ocorreu um erro, tente recarregar a pagina");    
    }
});

module.exports = router;