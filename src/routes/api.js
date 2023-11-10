const express = require("express")
const multer = require("multer");
const bcrypt = require("bcrypt");
const webtoken = require("jsonwebtoken");

const fs = require("node:fs");
const path = require("path");

const { Image } = require("../models/Post.js");
const { User } = require("../models/User.js");

const { storage, valid_formats, months, MY_SECRET, PREVIEW_PATH, get_preview } = require("../config.js");

const router = express.Router();
const upload = multer( { storage: storage } );

router.post("/upload", upload.single('file'), async (req, res) => {
    try {
        const name = req.file.filename.split(".")
        const format = name[name.length - 1];

        const media = fs.readFileSync(path.resolve(req.file.path));
        const token = req.cookies.token;

        const file_stat = fs.statSync(path.resolve(req.file.path));
        const mbs = file_stat.size / ( 1024*1024 );

        if (mbs >= 16) {
            return res.send("Por favor, envie arquivos com menos de 16mb");
        }

        if (!valid_formats.includes(format)) {
            return res.status(401).send("Formato de arquivo Invalido!");
        }

        const user_id = webtoken.verify(token, MY_SECRET);
        const db_user = await User.findOne({_id: user_id.id});

        const time_stamp = new Date().getTime();
        const file_name = `${time_stamp}_screenshot.jpg`;

        await get_preview(req.file.path, file_name);
        const preview = fs.readFileSync(path.resolve(PREVIEW_PATH, file_name));

        const date = new Date();
        const new_image = new Image({ 
            name: req.body.name,
            data: Buffer.from(media).toString("base64"),
            date: `${months[date.getMonth()]} ${date.getDay()}, ${date.getFullYear()}`,
            user: db_user.user,
            preview: Buffer.from(preview).toString("base64"),
            format: format
        });

        new_image.save().then(async (doc) => {
            const user = await User.findById(req.user.id);
            let ids = user.posts;
            ids = [...ids, { id: doc._id.toString(), name: req.body.name }];

            await User.updateOne(
                { _id: db_user._id },
                { $set: { posts: ids } },
                { new: true }
            );

            fs.unlinkSync(req.file.path);
            fs.unlinkSync(path.resolve(PREVIEW_PATH, file_name));
    
            return res.redirect("/media");
        });

    } catch(err) {
        res.status(401).send("ocorreu um erro");
        console.error(err);
    }
});

router.get("/clear", async (req, res) => {
    try {
        const referer = req.get('Referer');
        if (referer) {

            const user = webtoken.decode(token);
    
            await User.updateOne(
                { _id: user._id },
                { $set: { posts: [] } },
                { new: true }
            );

            await Image.deleteMany();
            return res.redirect(referer);
        }

        return res.send("Ocorreu um erro!");

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

router.post("/change-icon", upload.single('file'),  async (req, res) => {
    try {
        const token = req.cookies.token;
        const pfp = fs.readFileSync(path.resolve(req.file.path));

        const name = req.file.filename.split(".")
        const format = name[name.length - 1];
        const referer = req.get('Referer');

        const user_name = referer.split("/");

        const valid_pfp_formats = ["png", "jpg", "jfif"];
        if (!valid_pfp_formats.includes(format)) {
            return res.status(401).send("Formato de arquivo Invalido!");
        }

        if (req.user.name != user_name[user_name.length - 1]) {
            return res.send("<h1>Voce nao tem permissao para fazer isso ;-;</h1>");
        }

        if (!req.user.name) {
            return res.redirect("/");
        }

        const user_id = webtoken.verify(token, MY_SECRET);

        await User.updateOne({ _id: user_id.id }, { pfp: Buffer.from(pfp).toString("base64") });

        fs.unlinkSync(path.resolve(req.file.path));

        return res.redirect("/profile/" + req.user.name);

    } catch(err) {
        res.status(401).send("ocorreu um erro");
        console.error(err);
    }
});

router.get("/static/:id", async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);

        if (!image) {
            return res.status(404).send('Not Found');
        }

        res.set('Content-Type', 'image/png');
        return res.send(Buffer.from(image.preview, 'base64'));

    } catch (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
    }
});

module.exports = router;