const express = require("express")
const multer = require("multer");
const bcrypt = require("bcrypt");
const webtoken = require("jsonwebtoken");
const fs = require("node:fs");
const path = require("path");

const { User } = require("../models/User.js");
const { Image } = require("../models/Post.js"); 

const { storage, valid_formats, MY_SECRET, ABS_PATH } = require("../utils/config/config.js");
const { check_token } = require("./middlewares/check_token.js");

const { UploadMedia } = require("../services/UploadMedia.js");
const { ClearMedia } = require("../services/ClearMedia.js");
const { UpdateProfilePicture } = require("../services/UpdateProfilePicture.js");

require("dotenv").config({
    path: ABS_PATH
});

const router = express.Router();
const upload = multer( { storage: storage } );

router.post("/comment", check_token, async (req, res) => {
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

router.post("/upload", check_token, upload.fields([{ name: "file", maxCount: 1 }, { name: "preview", maxCount: 1 }]), async (req, res) => {

    const name = req.files["file"][0].filename.split(".");
    const format = name[name.length - 1];
    const token = req.cookies.token;

    if (!req.body.name) {
        return res.send("Insira um titulo!");
    }
    
    if (!valid_formats.includes(format)) {
        return res.status(400).send("Formato de arquivo Invalido!");
    }

    const preview = req.files["preview"] ? req.files["preview"][0].path : [];

    const upload_media = new UploadMedia(req.files["file"][0].path, process.env.MEDIA_BUCKET, req.files["file"][0].filename, preview, req.body.name, token);

    upload_media.execute().then(() => {
        return res.redirect("/media");
    }).catch((err) => {
        console.log(err);
        return res.send("Ocorreu um erro");
    });
});

router.get("/clear", check_token, async (req, res) => {
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
            maxAge: 1000 * 60 * 60 * 72
        });

        return res.redirect("/");
    } 
    catch (error) {
        return res.send("Ocorreu um erro, entre em contato com o suporte para tentar resolver o problema!");
    }
});

router.post("/change-icon", check_token, upload.single('file'),  async (req, res) => {
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

router.post("/user/follow/:name/:method", check_token, async (req, res) => {
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

router.get("/get_file/:path/:name", async (req, res) => {
    try {
        const valid_paths = ["imgs", "styles"];

        if (!req.params.path) {
            return res.send("Diretorio invalido");
        }

        if (!valid_paths.includes(req.params.path)) {
            return res.send("Diretorio invalido");
        }

        const file_dir = path.resolve(__dirname, "..", "public", "views", req.params.path);
        fs.readdir(file_dir, (err, files) => {

            if (files.length == 0) {
                return res.send("Arquivo nao encontrado");
            }

            const all_files = files;
            const file = all_files.filter((a) => a.includes(req.params.name));

            if (file.length == 0) {
                return res.send(`Arquivo ${req.params.name} nao foi encontrado`);
            }

            res.sendFile(path.resolve(file_dir, file[0]));
        })
    } catch(err) {
        console.log(err);
        return res.send("Ocorreu um erro");
    }
});

router.get("/bundle.js", (req, res) => {
    const file_dir = path.resolve(__dirname, "..", "public", "dist", "bundle.js");
    res.sendFile(file_dir);
});

router.post("/view/:id", async (req, res) => {
    try {   

        const post = await Image.findById(req.params.id);
        const user = await User.findOne({ user: post.user });

        if (!post) {
            return res.send({
                msg: "error",
                reason: "nao foi encontrado nenhum post com esse id"
            });
        }

        if (!user) {
            return res.send({
                msg: "error",
                reason: "nao foi encontrado nenhum usuario com este nome"
            });
        }
        
        const post_i = user.posts.findIndex((a) => a.id.toString() === req.params.id);

        post.views = post.views + 1;
        user.posts.set(post_i, { ...user.posts[post_i], views: post.views });

        await post.save();
        await user.save();
        
    } catch(err) {
        console.log(err);
        res.send({
            msg: "error",
            reason: "erro interno"
        });
    }
});

module.exports = router;