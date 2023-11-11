const webtoken = require("jsonwebtoken");
const fs = require("node:fs/promises");
const path = require("path");

const { User } = require("../models/User.js");
const { S3Storage } = require("../utils/S3Storage.js");

const { ABS_PATH } = require("../utils/config/config.js");

require("dotenv").config({
    path: ABS_PATH
});

/* 
    Aqui vai ficar a classe responsavel pela atualizao da foto de pefil do usuari, 
    so pra deixar as rotas mais limpas 
*/

class UpdateProfilePicture {

    constructor(bucket, path, token, filename) {
        this.name = bucket;
        this.path = path;
        this.token = token;
        this.filename = filename;
    }

    execute = () => { 
        return new Promise(async (res, rej) => {
            try {
                const storage = new S3Storage(this.name);

                const token = this.token;
                const file = await fs.readFile(path.resolve(this.path));
                const user_id = webtoken.verify(token, process.env.MY_SECRET);

                const user = await User.find({ name: user_id.name }).select("pfp_name -_id");

                await storage.delete(user.pfp_name);
                
                const timestamp = new Date().getTime();
                const filename = `${timestamp}__${this.filename}`;

                await storage.upload_file(file, filename);
                const url = await storage.get_url(filename);

                await User.updateOne({ _id: user_id.id }, { $set: { pfp: url, pfp_name: filename} }); 
                await fs.unlink(path.resolve( this.path ));

                res("Foto de perfil Atualizada com sucesso!");

            } catch(err) {
                rej(err);
            }
        });
    };
};

module.exports = { UpdateProfilePicture };