const express = require("express");

const app = express();
const ejs = require("ejs");
const multer = require("multer");
const path = require("path");
const fs = require("node:fs");

const { storage, initialize_db, valid_formats, months } = require("./config.js");
const { Image } = require("./models/Post.js");

app.use(express.static(path.join(__dirname, 'public', 'views')));
app.set('views', path.join(__dirname, 'public', 'views'));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded( { extended: true } ));

const upload = multer( { storage: storage } );

const remove_list = [];
const get_data = (images) => {
    
    if (images === undefined) {
        return;
    }

    const all_images = [];
    images.map((a, i) => {
        const image_data = fs.readFileSync(path.resolve(a.path));
        if (!image_data) {
            remove_list.push(a_doc._id);
        }
        all_images[i] = { data: Buffer.from(image_data).toString("base64"), ...a._doc };
    });

    return all_images;
};

const check_data = async () => {
    const media = await Image.find();
    if (!media.length) {
        return;
    }

    media.map(async (a, i) => {
        fs.readFile(path.resolve(a.path), async (err) => {
            if (err) {
                await Image.deleteOne({_id: a._id});
                console.log("Arquivo nao encontrado no servidor...", a.name);
            }
        });
    });
};

const interval = setInterval(async () => {
    // :P
    if (!remove_list.length) {
        return;
    }

    let a = remove_list.length;
    for (let i = 0; i < remove_list.length; i++) {
        await Image.delete({_id: remove_list[i]});
    }

    console.log("verificao removeu", a, "itens da database!");

}, 1000 * 10);

initialize_db().then(async () => {
    await check_data();
    app.listen("8080");
    console.log("servidor iniciado");
});

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.get("/media", async (req, res) => {
    try {
        const images = await Image.find();
        res.render("media.ejs", { images: get_data(images) });
    } catch(err) {
        res.send("ocorreu um erro, tente recarregar a pagina");
        await check_data();
    }
});

app.get("/search", async (req, res) => {
    try {
        res.render("search.ejs");
    } catch(err) {
        console.log(err);
        res.send("ocorreu um erro");
    }
});

app.get("/media/:id", async (req, res) => {
    try {
        const image = await Image.find({_id: req.params.id});
        res.render("post.ejs", { image: get_data(image) });
    } catch(err) {
        res.send("ocorreu um erro, tente recarregar a pagina");
        await check_data();
    }
});

app.post("/api", upload.single('file'), async (req, res) => {
    try {
        const file_arr = req.file.filename.split(".")
        const ext = file_arr[file_arr.length - 1];

        if (!valid_formats.includes(ext)) {
            return res.status(401).send("Formato de arquivo Invalido!");
        }

        const date = new Date();
        const new_image = new Image({
            name: req.body.name,
            path: req.file.path,
            date: `${months[date.getMonth()]} ${date.getDay()}, ${date.getFullYear()}`,
            country: req.body.country,
            format: ext
        });

        await new_image.save();
        res.redirect("/");

    } catch(err) {
        res.status(401).send("ocorreu um erro");
        console.error(err);
    }
});

app.get("/api/clear", async (req, res) => {
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

app.get("/api/search/:name", async (req, res) => {
    try {
        const result = await Image.find({ name: req.params.name });
        res.send(get_data(result) || []);
    } catch(err) {
      res.status(401).send("ocorreu um erro");
        await check_data();
    }
});