import { v2 as cloudinary } from "cloudinary";

function configure() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud_name || !api_key || !api_secret) {
    throw new Error("Cloudinary credentials are not configured");
  }
  cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
}

export async function uploadBuffer(file: File, folder: string) {
  configure();
  const bytes = Buffer.from(await file.arrayBuffer());
  return new Promise<{ url: string; publicId: string; resourceType: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error || !result) return reject(error || new Error("Cloudinary upload failed"));
        resolve({ url: result.secure_url, publicId: result.public_id, resourceType: result.resource_type });
      },
    );
    stream.end(bytes);
  });
}

export async function deleteCloudinaryAsset(publicId: string, resourceType?: string) {
  configure();
  const candidates = resourceType ? [resourceType] : ["image", "raw", "video"];
  for (const candidate of candidates) {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: candidate });
    if (result.result === "ok") return;
  }
}
