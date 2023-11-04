const express = require("express")
const multer = require("multer");

const { Image } = require("../models/Post.js");
const { storage, get_data, check_data, valid_formats, months } = require("../config.js");

const router = express.Router();
const upload = multer( { storage: storage } );

router.post("/", upload.single('file'), async (req, res) => {
    try {
        const name = req.file.filename.split(".")
        const format = name[name.length - 1];

        if (!valid_formats.includes(format)) {
            return res.status(401).send("Formato de arquivo Invalido!");
        }

        const date = new Date();
        const new_image = new Image({
            name: req.body.name,
            path: req.file.path,
            date: `${months[date.getMonth()]} ${date.getDay()}, ${date.getFullYear()}`,
            country: req.body.country,
            format: format
        });

        await new_image.save();
        res.redirect("/");

    } catch(err) {
        res.status(401).send("ocorreu um erro");
        console.error(err);
    }
});

router.get("/clear", async (req, res) => {
    try {
        const referer = req.get('Referer');
        if (referer) {
            await Image.deleteMany();
            return res.redirect(referer);
        }

        res.send("Ocorreu um erro!");

    } catch(err) {
        res.status(401).send("ocorreu um erro");
        console.error(err);
    } 
});

router.get("/search/:name", async (req, res) => {
    try {
        const regex = new RegExp(req.params.name, "i");
        const result = await Image.find({ name: regex });
        res.send(get_data(result) || []);
    } catch(err) {
      res.status(401).send("ocorreu um erro");
        await check_data();
    }
});

module.exports = router;