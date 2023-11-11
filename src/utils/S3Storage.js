const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, GetObjectCommandOutput } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { ABS_PATH } = require("./config/config");
require("dotenv").config({ path: ABS_PATH });

module.exports = {
    S3Storage: class S3Storage {
        constructor(name) {
            this.client = new S3Client({
                region: process.env.AWS_STORAGE,
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_ID,
                    secretAccessKey: process.env.AWS_SECRET_KEY
                }
            });
            this.bucket_name = name;
        }

        async upload_file(file, name) {
            try {
                const params = {
                    Bucket: this.bucket_name,
                    Key: name,
                    Body: file
                };
                const command = new PutObjectCommand(params);
                await this.client.send(command);
                console.log(`arquivo ${name} foi enviado com sucesso para o bucket!`);
            } catch (err) {
                console.log(err);
            }
        }

        async get_url(name) {
            try {
                const params = {
                    Bucket: this.bucket_name,
                    Key: name,
                };
                const command = new GetObjectCommand(params);
                const requestUrl = await getSignedUrl(this.client, command, { expiresIn: 3600 });
                return requestUrl;
            } catch (err) {
                console.log(err);
            }
        }

        async delete(name) {
            try {
                const params = {
                    Bucket: this.bucket_name,
                    Key: name,
                };
                const command = new DeleteObjectCommand(params);
                await this.client.send(command);
                console.log(`arquivo ${name} foi deletado do bucket!`);
            } catch (err) {
                console.log(err);
            }
        }
    }
};
