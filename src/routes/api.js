const express = require("express")
const multer = require("multer");
const bcrypt = require("bcrypt");
const webtoken = require("jsonwebtoken");

const { User } = require("../models/User.js");
const { Image } = require("../models/Post.js"); 

const { storage, valid_formats, MY_SECRET, ABS_PATH } = require("../utils/config/config.js");

const { UploadMedia } = require("../services/UploadMedia.js");
const { ClearMedia } = require("../services/ClearMedia.js");
const { UpdateProfilePicture } = require("../services/UpdateProfilePicture.js");

require("dotenv").config({
    path: ABS_PATH
});

const router = express.Router();
const upload = multer( { storage: storage } );

router.post("/comment", async (req, res) => {
    try {
        const { content, id } = req.body;
        const user = req.user.name;

        if (!user) {
            return res.send({
                msg: "usuario nao especificado"
            });
        }

        if (!content) {
            return res.send({
                msg: "content nao especificado"
            });
        }

        const media = await Image.findById(id);
        const user_ = await User.findById(req.user.id);

        if (!media) {
            return res.send({
                msg: "media nao encontrada"
            });
        }

        const media_comment = media.comments || [];
        const user_comment = user_.comments || [];

        media_comment.push({
            user: user,
            content: content
        });

        user_comment.push({
            user: user,
            content: content
        });

        const new_post_comments = media_comment;
        const new_user_comments = user_comment;

        await Image.findByIdAndUpdate(id, { $set: { comments: new_post_comments } }, { new: true });
        await User.findByIdAndUpdate(req.user.id, { $set: { comments: new_user_comments } }, { new: true });

        res.status(200).send({
            msg: "success"
        });

    } catch(err) {
        console.log(err);
        res.send({
            msg: "error" + err
        });
    }
});

router.post("/upload", upload.single('file'), async (req, res) => {
    const name = req.file.filename.split(".");
    const format = name[name.length - 1];
    const token = req.cookies.token;

    if (!req.body.name) {
        return res.send("Insira um titulo!");
    }
    
    if (!valid_formats.includes(format)) {
        return res.status(400).send("Formato de arquivo Invalido!");
    }

    const upload_media = new UploadMedia(req.file.path, process.env.MEDIA_BUCKET, req.file.filename, req.body.name, token);

    upload_media.execute().then(() => {
        return res.redirect("/media");
    }).catch((err) => {
        console.log(err);
        return res.send("Ocorreu um erro");
    });
});

router.get("/clear", async (req, res) => {
    try {
        const referer = req.get('Referer');
        if (!referer) {
            return res.redirect("/");
        }

        const clear_media = new ClearMedia(process.env.MEDIA_BUCKET);
        await clear_media.execute();

        return res.redirect(referer);

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
    
        const email_exist = await User.find({email: email});
        const user_exist = await User.find({user: user});
        if (email_exist.length > 0) {
            return res.send("Ja existe um usuario com este email!");
        }

        if (user_exist.length > 0) {
            return res.send("Ja existe um usuario com este nome de usuario!");
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

        const update_profile_picture = new UpdateProfilePicture(process.env.PFP_BUCKET, req.file.path, token, req.file.filename);
        await update_profile_picture.execute();

        return res.redirect("/profile/" + req.user.name);

    } catch(err) {
        res.status(401).send("ocorreu um erro");
        console.error(err);
    }
});

router.post("/user/follow/:name/:method", async (req, res) => {
    try {
        const target_user = await User.findOne({ user: req.params.name });
        if (!target_user) {
            return res.send({
                code: 1 // nao existe
            });
        }

        const current_user = await User.findById(req.user.id);
        if (Number(req.params.method) === 0) {
            if (current_user.following.includes(target_user.user)) {
                return res.send({
                    code: 2 // ja segue
                });
            }
            current_user.following.push(target_user.user);
            target_user.followers.push(current_user.user);
        } 
        else if (Number(req.params.method) === 1) {
            if (!current_user.following.includes(target_user.user)) {
                return res.send({
                    code: 3 // nao segue entao nao precisa dar unfollow
                });
            }
            current_user.following = current_user.following.filter((followed) => followed !== target_user.user);
            target_user.followers = target_user.followers.filter((follower) => follower !== current_user.user);
        }

        await current_user.save();
        await target_user.save();

        return res.send({
            code: 0
        });

    } catch (err) {
        console.log(err);
        return res.send("Ocorreu um erro!");
    }
});

module.exports = router;