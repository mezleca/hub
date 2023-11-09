const express = require("express")
const bcrypt = require("bcrypt");
const webtoken = require("jsonwebtoken");

const { User } = require("../models/User");
const { MY_SECRET } = require("../config");

const router = express.Router();

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
            maxAge: 72 * 60 * 60 // * 1000

            // depois so tirar o 1000 para deixar o usuario logado por 72 horas
        });

        return res.redirect("/media");
    } 
    catch (error) {
        console.log(error);
        return res.send("Ocorreu um erro, entre em contato com o suporte para tentar resolver o problema!");
    }
});

module.exports = router;