// backend/src/config/cloudinary.js
const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a buffer (from multer memoryStorage) to Cloudinary.
 * @param {Buffer} buffer  – file buffer
 * @param {object} opts    – { folder, publicId, transformation, ... }
 * @returns {Promise<{ url: string, publicId: string }>}
 */
function uploadBuffer(buffer, opts = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: opts.folder || "nexora",
        public_id: opts.publicId,
        resource_type: "image",
        overwrite: true,
        ...(opts.transformation && { transformation: opts.transformation }),
      },
      (err, result) => {
        if (err) return reject(err);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

/**
 * Delete a resource from Cloudinary by public_id.
 * @param {string} publicId
 */
async function deleteByPublicId(publicId) {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}

/**
 * Extract public_id from a Cloudinary URL.
 * E.g. https://res.cloudinary.com/xxx/image/upload/v123/nexora/abc.jpg → nexora/abc
 */
function publicIdFromUrl(url) {
  if (!url || !url.includes("cloudinary.com")) return null;
  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    // after /upload/ there may be version like v1234567890/
    let tail = parts[1];
    // remove version prefix
    tail = tail.replace(/^v\d+\//, "");
    // remove file extension
    tail = tail.replace(/\.[^.]+$/, "");
    return tail;
  } catch {
    return null;
  }
}

module.exports = { cloudinary, uploadBuffer, deleteByPublicId, publicIdFromUrl };
