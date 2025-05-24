import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const opts = {
  overwrite: true,
  invalidate: true,
  resource_type: "auto",
  transformation: [
    {
      width: 300,
      height: 400,
      crop: "fill",
      gravity: "center",
      quality: "auto",
    },
  ],
};

export default async function uploadImage(image) {
  let imageStr;

  if (Buffer.isBuffer(image)) {
    const base64 = image.toString("base64");
    imageStr = `data:image/jpeg;base64,${base64}`;
  } else if (typeof image === "string") {
    imageStr = image;
  } else {
    throw new Error("Invalid image format");
  }

  try {
    const result = await cloudinary.uploader.upload(imageStr, opts);
    if (result.secure_url) {
      return {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }
    throw new Error("Upload failed: No secure_url returned");
  } catch (error) {
    throw new Error(error.message || "Upload failed");
  }
}
