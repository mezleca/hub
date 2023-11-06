const express = require("express")
const multer = require("multer");
const bcrypt = require("bcrypt");
const webtoken = require("jsonwebtoken");

const { Image } = require("../models/Post.js");
const { User } = require("../models/User.js");

const { storage, valid_formats, months, MY_SECRET } = require("../config.js");
const { check_token } = require("./middlewares/check_token.js");

const router = express.Router();
const upload = multer( { storage: storage } );

router.post("/", check_token, upload.single('file'), async (req, res) => {
    try {
        const name = req.file.filename.split(".")
        const format = name[name.length - 1];

        const token = req.cookies.token;

        if (!valid_formats.includes(format)) {
            return res.status(401).send("Formato de arquivo Invalido!");
        }

        const user_id = webtoken.verify(token, MY_SECRET);
        const db_user = await User.findOne({_id: user_id.id});

        const date = new Date();
        const new_image = new Image({ 
            name: req.body.name,
            path: req.file.path,
            date: `${months[date.getMonth()]} ${date.getDay()}, ${date.getFullYear()}`,
            user: db_user.user,
            format: format
        });

        await new_image.save();
        res.redirect("/");

    } catch(err) {
        res.status(401).send("ocorreu um erro");
        console.error(err);
    }
});

router.get("/clear", check_token, async (req, res) => {
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

router.post("/register", async (req, res) => {
    try {
        const { user, pass, email } = req.body;

        if (!user) {
            return res.send("Campo de usuario invalido");
        }
    
        if (!pass) {
            return res.send("Campo de senha invalido");
        }
    
        if (!email) {
            return res.send("Campo de email invalido");
        }
    
        const user_exist = await User.find({email: email});
        if (user_exist.length > 0) {
            return res.send("Ja existe um usuario com este email!");
        }

        const salt = await bcrypt.genSalt(6);
        const new_password = await bcrypt.hash(pass, salt);

        const new_user = new User({
            user: user,
            email: email,
            pass: new_password
        });

        await new_user.save();
        res.redirect("/auth/login");

    } catch (err) {
        res.status(401).send("ocorreu um erro");
        console.error(err);
    }
});

router.post("/login", async (req ,res) => {
    try {
        const { email, pass } = req.body;

        if (!email) {
            return res.send("Campo de email invalido");
        }

        if (!pass) {
            return res.send("Campo de senha invalido");
        }

        const user_exist = await User.findOne({email: email});
        if (!user_exist) {
            return res.send("Email invalido!");
        }

        const uncrypted_pass = await bcrypt.compare(pass, user_exist.pass);
        if (!uncrypted_pass) {
            return res.send("Senha invalida!");
        }

        const token = webtoken.sign({
            id: user_exist._id,
            user: user_exist.user
        }, MY_SECRET, { expiresIn: "72h" });

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 259200
        });

        return res.redirect("/");
    } 
    catch (error) {
        return res.send("Ocorreu um erro, entre em contato com o suporte para tentar resolver o problema!");
    }
});

module.exports = router;