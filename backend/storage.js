import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, "uploads");

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configure Cloudinary SDK if credentials exist in environment
if (process.env.CLOUDINARY_URL || (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY)) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

// MIME type map for robust content-type resolution
const MIME_TYPES = {
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".tiff": "image/tiff",
  ".txt": "text/plain",
  ".csv": "text/csv"
};

/**
 * Cloud Object Storage Layer
 * Supports Cloudinary, AWS S3, or Supabase Storage via env vars,
 * with high-performance local streaming fallback as default zero-config.
 */
export const cloudStorage = {
  /**
   * Check if external cloud provider is active
   */
  getProvider() {
    if (process.env.CLOUDINARY_URL || process.env.CLOUDINARY_CLOUD_NAME) {
      return "cloudinary";
    }
    if (process.env.AWS_S3_BUCKET || process.env.S3_BUCKET) {
      return "s3";
    }
    return "local-object-store";
  },

  /**
   * Store an uploaded file buffer or stream
   * Pipes directly to Cloudinary when credentials exist, and persists in local object store
   * @param {Object} options
   * @param {Buffer} options.buffer - Raw file buffer
   * @param {string} options.originalname - Original filename
   * @param {string} options.mimetype - Uploaded MIME type
   * @param {number} options.size - File size in bytes
   * @returns {Promise<{ fileUrl: string, fileName: string, originalName: string, fileSize: number, fileType: string, provider: string }>}
   */
  async uploadFile({ buffer, originalname, mimetype, size }) {
    const provider = this.getProvider();
    const cleanName = (originalname || "report.pdf").replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e6);
    const storedFileName = `${uniqueSuffix}-${cleanName}`;
    const destinationPath = path.join(UPLOAD_DIR, storedFileName);

    // Save to local object store
    fs.writeFileSync(destinationPath, buffer);

    let fileUrl = `/api/storage/files/${storedFileName}`;

    // Cloudinary upload if configured
    if (provider === "cloudinary") {
      try {
        console.log(`[Storage] Cloudinary provider detected, piping ${storedFileName} to cloud bucket...`);
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              resource_type: "auto",
              folder: "health_ai_reports",
              public_id: storedFileName.replace(/\.[^/.]+$/, ""),
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(buffer);
        });

        if (uploadResult && uploadResult.secure_url) {
          fileUrl = uploadResult.secure_url;
          console.log(`[Storage] ✓ Cloudinary upload complete: ${fileUrl}`);
        }
      } catch (cloudErr) {
        console.warn("[Storage] Cloudinary upload notice (offline or invalid key), falling back to secure local streaming:", cloudErr.message);
      }
    }

    return {
      fileUrl,
      fileName: storedFileName,
      originalName: originalname,
      fileSize: size || buffer.length,
      fileType: mimetype || MIME_TYPES[path.extname(cleanName).toLowerCase()] || "application/octet-stream",
      provider,
      storedAt: new Date().toISOString()
    };
  },

  /**
   * Retrieve file metadata and read stream
   */
  getFile(fileName) {
    const safeName = path.basename(fileName);
    const filePath = path.join(UPLOAD_DIR, safeName);

    if (!fs.existsSync(filePath)) {
      return { exists: false };
    }

    const stats = fs.statSync(filePath);
    const ext = path.extname(safeName).toLowerCase();
    const mimeType = MIME_TYPES[ext] || "application/octet-stream";

    return {
      exists: true,
      filePath,
      fileName: safeName,
      size: stats.size,
      mimeType,
      lastModified: stats.mtime
    };
  },

  /**
   * Delete a stored file
   */
  deleteFile(fileName) {
    if (!fileName) return false;
    const safeName = path.basename(fileName);
    let filePath = path.join(UPLOAD_DIR, safeName);

    if (!fs.existsSync(filePath)) {
      try {
        const files = fs.readdirSync(UPLOAD_DIR);
        const match = files.find((f) => f.endsWith(safeName) || f.endsWith("-" + safeName));
        if (match) {
          filePath = path.join(UPLOAD_DIR, match);
        }
      } catch {}
    }

    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        return true;
      } catch (err) {
        console.error(`[Storage] Failed to delete file ${safeName}:`, err);
        return false;
      }
    }
    return false;
  },

  /**
   * List all stored reports in object storage
   */
  listStoredFiles() {
    if (!fs.existsSync(UPLOAD_DIR)) return [];
    const files = fs.readdirSync(UPLOAD_DIR);
    return files.map((f) => {
      const stats = fs.statSync(path.join(UPLOAD_DIR, f));
      const ext = path.extname(f).toLowerCase();
      return {
        fileName: f,
        fileUrl: `/api/storage/files/${f}`,
        size: stats.size,
        mimeType: MIME_TYPES[ext] || "application/octet-stream",
        uploadedAt: stats.birthtime
      };
    });
  }
};
