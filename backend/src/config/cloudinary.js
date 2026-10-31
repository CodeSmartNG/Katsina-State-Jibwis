import { v2 as cloudinary } from 'cloudinary';
// 👇 Changed to the v2 package to fix the NPM dependency conflict
import { CloudinaryStorage } from 'multer-storage-cloudinary-v2'; 
import multer from 'multer';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'jibwis_profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }], // Compress image
  },
});

export const upload = multer({ storage });
