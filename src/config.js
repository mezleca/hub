const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("node:fs");

const { Image } = require("./models/Post.js");

const ABS_PATH = path.resolve(__dirname, "..", ".env");
const valid_formats = ['jpg', 'png', 'jpeg', 'gif', 'mp4', 'jfif'];

const months = [
    "January",  
    "February", 
    "March",    
    "April",    
    "May",      
    "June",     
    "July",     
    "August",   
    "September",
    "October",  
    "November", 
    "December"  
  ];

fs.access(path.resolve("src", "uploads"), (err) => {
    if (err) {
        fs.mkdirSync(path.resolve("src", "uploads"));
    }
});

require("dotenv").config({
    path: ABS_PATH
});

const initialize_db = async () => {
    return mongoose.connect(process.env.DATABASE);
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, path.resolve("src", "uploads"));
    },
    filename: (req, file, callback) => {
        const timestamp = new Date().getTime();
        callback(null, `${timestamp}_${file.originalname}`);
    }
});

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

module.exports = {
    ABS_PATH,
    initialize_db,
    storage,
    valid_formats,
    months,
    check_data,
    get_data
};