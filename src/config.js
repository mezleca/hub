const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("node:fs");
const ffmpeg = require('fluent-ffmpeg');

const UPLOADS_PATH = path.resolve(__dirname, "uploads");
const ABS_PATH = path.resolve(__dirname, "..", ".env");
const PREVIEW_PATH = path.resolve(__dirname, "preview");
const valid_formats = ["mp4", "webm", "ogv", "avi", "mov", "flv", "mkv", "wmv"];

fs.access(UPLOADS_PATH, (err) => {
    if (err) {
        fs.mkdirSync(UPLOADS_PATH);
    }
});

fs.access(PREVIEW_PATH, (err) => {
    if (err) {
        fs.mkdirSync(PREVIEW_PATH);
    }
});

require("dotenv").config({ path: ABS_PATH });
const MY_SECRET = process.env.MY_SECRET;

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

const get_preview = (video, name) => {
    return new Promise((resolve, reject) => {
        ffmpeg({ source: video })
        .on('error', (err) => {
            console.log(err);
            reject(err);
        })
        .takeScreenshots({
            filename: name,
            timemarks: [0]
        }, PREVIEW_PATH)
        .on("end", () => {
            resolve();
        });
    });
};

const initialize_db = async () => {
    return mongoose.connect(process.env.DATABASE);
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, UPLOADS_PATH);
    },
    filename: (req, file, callback) => {
        const timestamp = new Date().getTime();
        callback(null, `${timestamp}_${file.originalname}`);
    }
});

module.exports = {
    ABS_PATH,
    MY_SECRET,
    PREVIEW_PATH,
    UPLOADS_PATH,
    storage,
    valid_formats,
    months,
    initialize_db,
    get_preview
};