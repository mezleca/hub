const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("node:fs");
const ffmpeg = require('fluent-ffmpeg');

const UPLOADS_PATH = path.resolve(__dirname, "..", "..", "..", "temp_upload");
const ABS_PATH = path.resolve(__dirname, "..", "..", "..", ".env");
const PREVIEW_PATH = path.resolve(__dirname, "..", "..", "..", "temp_preview");
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

const duration = (tempo_float) => {
    const minutos = Math.floor(tempo_float / 60);
    const segundos = Math.floor(tempo_float % 60);

    const minutos_formatados = minutos < 10 ? `0${minutos}` : `${minutos}`;
    const segundos_formatados = segundos < 10 ? `0${segundos}` : `${segundos}`;

    return `${minutos_formatados}:${segundos_formatados}`;
}

const get_video_duration = (src) => {

    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(path.resolve(src), function(err, metadata) {
    
            if (err)
                reject(0);
    
            resolve(duration(metadata.format.duration));
        });
    })
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
    get_preview,
    get_video_duration,
    duration
};