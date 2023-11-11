const express = require("express");
const app = express();
const path = require("path");
const cookie_parser = require("cookie-parser");
const webtoken = require("jsonwebtoken");

const { initialize_db } = require("./utils/config/config.js");
const { check_token } = require("./routes/middlewares/check_token.js");

const index_router = require("./routes/index.js");
const create_router = require("./routes/create.js");
const media_router = require("./routes/media.js");
const api_router = require("./routes/api.js");
const search_router = require("./routes/search.js");
const auth_router = require("./routes/auth.js");
const profile_router = require("./routes/profile.js");

app.use(express.static(path.join(__dirname, 'public', 'views')));
app.set('views', path.join(__dirname, 'public', 'views'));
app.set('view engine', 'ejs');
app.use(cookie_parser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(async (req, res, next) => {
    try {
        const token = req.cookies.token;
        const akowdkaowd = webtoken.decode(token);
        req.user = {
            id: akowdkaowd.id,
            name: akowdkaowd.user
        }
        next();
    }
    catch(err) {
        req.user = {
            name: ""
        }
        next(); // fds
    }
});

app.use("/", index_router);
app.use("/auth", auth_router);
app.use("/create", create_router);

app.use(check_token);

app.use("/media", media_router);
app.use("/api", api_router);
app.use("/search", search_router);
app.use("/profile", profile_router);

initialize_db().then(() => {
    app.listen(8080);
    console.log("Servidor iniciado");
});