"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageDao = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
class StorageDao {
    BUCKET = "chance-340";
    REGION = "us-east-1";
    client = new client_s3_1.S3Client({ region: this.REGION });
    async putImage(fileName, imageStringBase64Encoded, fileType) {
        let decodedImageBuffer = Buffer.from(imageStringBase64Encoded, "base64");
        const s3Params = {
            Bucket: this.BUCKET,
            Key: "image/" + fileName,
            Body: decodedImageBuffer,
            ContentType: `image/${fileType}`,
            ACL: client_s3_1.ObjectCannedACL.public_read,
        };
        const c = new client_s3_1.PutObjectCommand(s3Params);
        try {
            await this.client.send(c);
            return `https://${this.BUCKET}.s3.${this.REGION}.amazonaws.com/image/${fileName}`;
        }
        catch (error) {
            throw Error("s3 put image failed with: " + error);
        }
    }
}
exports.StorageDao = StorageDao;
