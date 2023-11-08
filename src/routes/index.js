const express = require("express")
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        res.render("index.ejs", { user: { name: req.user.name } });
    } catch(err) {
        console.log(err);
    }
});

module.exports = router;