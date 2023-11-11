const path = require("path");
const webtoken = require("jsonwebtoken");
const fs = require("node:fs/promises");

const { Image } = require("../models/Post.js");
const { User } = require("../models/User.js");
const { S3Storage } = require("../utils/S3Storage");

const { months, PREVIEW_PATH, get_preview, get_video_duration, ABS_PATH } = require("../utils/config/config.js");

require("dotenv").config({
    path: ABS_PATH
});

/* 
    Aqui vai ficar a classe responsavel pelo upload de media, 
    so pra deixar as rotas mais limpas 
*/

class UploadMedia {

    constructor(path, bucket, filename, db_name, token) {
        this.path = path;
        this.name = bucket;
        this.filename = filename;
        this.token = token;
        this.db_name = db_name;
    }

    execute = () => { 
        return new Promise(async (res, rej) => {
            try {
                const storage = new S3Storage(this.name);
                const preview_storage = new S3Storage(process.env.PREVIEW_BUCKET);

                const name = this.filename.split(".");
                const format = name[name.length - 1];

                const token = this.token;

                const user_id = webtoken.verify(token, process.env.MY_SECRET);
                const db_user = await User.findOne({_id: user_id.id});

                const date = new Date();
                const time_stamp = date.getTime();
                const file_name = `${time_stamp}_${this.filename}`;
                const preview_name = `${time_stamp}_preview.jpg`;
                const upload_date = `${months[date.getMonth()]} ${date.getDay()}, ${date.getFullYear()}`;

                await get_preview(this.path, preview_name);

                const media = await fs.readFile(path.resolve(this.path));
                const preview = await fs.readFile(path.resolve(PREVIEW_PATH, preview_name));
                const duration = await get_video_duration(this.path);

                await storage.upload_file(media, file_name);
                await preview_storage.upload_file(preview, preview_name);

                const media_url = await storage.get_url(file_name);
                const preview_url = await preview_storage.get_url(preview_name);

                const new_image = new Image({ 
                    name: this.db_name,
                    original_name: file_name,
                    data: media_url,
                    date: upload_date,
                    user: db_user.user,
                    preview: preview_url,
                    preview_name: preview_name,
                    format: format,
                    likes: 0,
                    duration: duration
                });

                new_image.save().then(async (doc) => {
                    const user = await User.findById(db_user._id);
                    let ids = user.posts;

                    ids = [...ids, { id: doc._id.toString(), name: this.db_name, date: upload_date, duration: duration, preview: preview_url }];

                    await User.updateOne(
                        { _id: db_user._id },
                        { $set: { posts: ids } },
                        { new: true }
                    );

                    await fs.unlink(this.path);
                    await fs.unlink(path.resolve(PREVIEW_PATH, preview_name));

                    res("Arquivo foi enviado com sucesso");
                });
            } catch(err) {
                rej(err);
            }
        });
    };
};

module.exports = { UploadMedia };