const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
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
            } catch (err) {
                console.log(err);
            }
        }

        async get_url(name) {
            try {
                const requestUrl = `https://${this.bucket_name}.s3.${process.env.AWS_REGION}.amazonaws.com/${name}`;
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
            } catch (err) {
                console.log(err);
            }
        }
    }
};
