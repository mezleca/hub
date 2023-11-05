const express = require("express")
const router = express.Router();

router.get("/register", (req, res) => {
    res.render("register.ejs", { user: { name: "" } });
});

router.get("/login", async (req, res) => {
    res.render("login.ejs", { user: { name: "" } });
});

module.exports = router;