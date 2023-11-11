const { Image } = require("../models/Post.js");
const { User } = require("../models/User.js");
const { S3Storage } = require("../utils/S3Storage.js");

const { ABS_PATH } = require("../utils/config/config.js");

require("dotenv").config({
    path: ABS_PATH
});

/* 
    Aqui vai ficar a classe responsavel pela remocao de todas as medias, 
    so pra deixar as rotas mais limpas 
*/

class ClearMedia {

    constructor(bucket) {
        this.name = bucket;
    }

    execute = () => { 
        return new Promise(async (res, rej) => {
            try {
                const media_storage = new S3Storage(this.name);
                const preview_storage = new S3Storage(process.env.PREVIEW_BUCKET); // uwu ewe owo

                const all_posts = await Image.find();
                if (!all_posts) {
                    res();
                }

                all_posts.map(async (v) => {
                   await media_storage.delete(v.original_name);
                   await preview_storage.delete(v.preview_name);
                   await User.updateOne( { user: v.user }, { $set: { posts: [] } }, { new: true } );
                });

                await Image.deleteMany();

                res("Todos as medias foram deletadas!");

            } catch(err) {
                rej(err);
            }
        });
    };
};

module.exports = { ClearMedia };