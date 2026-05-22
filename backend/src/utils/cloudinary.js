import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const uploadOnCloudinary = async (localFilePath) => {
  // ✅ Configure INSIDE the function — runs at call time, not import time
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
    api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET,
  });

  try {
    if (!localFilePath) throw new Error("No file path provided");

    if (!fs.existsSync(localFilePath)) {
      throw new Error(`File does not exist: ${localFilePath}`);
    }

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log("Upload success:", response.secure_url);

    fs.unlink(localFilePath, (err) => {
      if (err) console.log("File delete error:", err);
      else console.log("Local file deleted");
    });

    return response;
  } catch (error) {
    console.log("Cloudinary upload error:", error);
    throw error;
  }
};

export { uploadOnCloudinary };
