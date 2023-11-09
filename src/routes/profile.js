const express = require("express")
const router = express.Router();

const { User } = require("../models/User.js");

router.get("/:name", async (req, res) => {
    try {
        const result = await User.find({ user: req.params.name });
        if (result.length == 0) {
            return res.status(404).send("<h1 style='margin: 15px;'>Usuario nao encontrado</h1>");
        }
        res.render("profile.ejs", { result: result[0] || [], user: { name: req.user.name } });
    } catch(err) {
        console.log(err);
        res.status(401).send("ocorreu um erro");
    }
});

module.exports = router;