const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("node:fs");

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

module.exports = {
    ABS_PATH,
    initialize_db,
    storage,
    valid_formats,
    months
};