const express = require("express");
const app = express();
const path = require("path");
const cookie_parser = require("cookie-parser");

const { initialize_db, check_data } = require("./config.js");

const hub_router = require("./routes/hub.js");
const api_router = require("./routes/api.js");
const search_router = require("./routes/search.js");
const auth_router = require("./routes/auth.js");

app.use(express.static(path.join(__dirname, 'public', 'views')));
app.set('views', path.join(__dirname, 'public', 'views'));
app.set('view engine', 'ejs');
app.use(cookie_parser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", hub_router);
app.use("/auth", auth_router);
app.use("/api", api_router);
app.use("/search", search_router);

initialize_db().then(async () => {
    await check_data();
    app.listen(8080);
    console.log("Servidor iniciado");
});
