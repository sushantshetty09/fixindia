import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import sharp from "sharp";

const REGION = "us-east-1"; // Storj usually uses this for S3 compat
const BUCKET = process.env.STORJ_BUCKET;

const s3Client = new S3Client({
  region: REGION,
  endpoint: process.env.STORJ_ENDPOINT || "https://gateway.storjshare.io",
  credentials: {
    accessKeyId: process.env.STORJ_ACCESS_KEY || "",
    secretAccessKey: process.env.STORJ_SECRET_KEY || "",
  },
  forcePathStyle: true, // Required for Storj
});

export const storage = {
  /**
   * Compresses an image using Sharp and uploads it to Storj DCS
   * @param file The file object from Elysia
   * @returns The object key (path) of the uploaded image
   */
  async uploadImage(file: File): Promise<string> {
    if (!BUCKET) throw new Error("STORJ_BUCKET environment variable not set");

    const buffer = Buffer.from(await file.arrayBuffer());
    const key = `reports/${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;

    console.log(`📸 Processing image: ${file.name} (${(buffer.length / 1024).toFixed(2)} KB)`);

    // Compression pipeline: Resize to max 1200px width, convert to WebP with 80% quality
    const compressedBuffer = await sharp(buffer)
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 80 })
      .toBuffer();

    console.log(`📦 Compressed image: ${(compressedBuffer.length / 1024).toFixed(2)} KB`);

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: compressedBuffer,
      ContentType: "image/webp",
    });

    try {
      await s3Client.send(command);
      console.log(`✅ Uploaded to Storj: ${key}`);
      return key; // We store the key in the database
    } catch (error) {
      console.error("❌ Storj upload failed:", error);
      throw error;
    }
  },

  /**
   * Generates a pre-signed URL for viewing a private file
   * @param key The object key (from database)
   * @returns A temporary signed URL (expires in 1 hour)
   */
  async getSignedUrl(key: string): Promise<string> {
    if (!key) return "";
    if (!BUCKET) throw new Error("STORJ_BUCKET not set");

    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    });

    try {
      // URL expires in 3600 seconds (1 hour)
      return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    } catch (error) {
      console.error("❌ Failed to sign URL:", error);
      return "";
    }
  }
};
