import {
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { StorageDaoI } from "../interfaces/StorageDaoI";

export class StorageDao implements StorageDaoI {
  private readonly BUCKET = "chance-340";
  private readonly REGION = "us-east-1";
  private readonly client = new S3Client({ region: this.REGION });

  async putImage(
    fileName: string,
    imageStringBase64Encoded: string,
    fileType: string,
  ): Promise<string> {
    let decodedImageBuffer: Buffer = Buffer.from(
      imageStringBase64Encoded,
      "base64",
    );
    const s3Params = {
      Bucket: this.BUCKET,
      Key: "image/" + fileName,
      Body: decodedImageBuffer,
      ContentType: `image/${fileType}`,
      ACL: ObjectCannedACL.public_read,
    };
    const c = new PutObjectCommand(s3Params);
    try {
      await this.client.send(c);
      return `https://${this.BUCKET}.s3.${this.REGION}.amazonaws.com/image/${fileName}`;
    } catch (error) {
      throw Error("s3 put image failed with: " + error);
    }
  }
}
