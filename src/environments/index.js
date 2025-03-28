import { config } from 'dotenv';

config();

export const PORT = process.env.PORT;
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_URL = process.env.CLOUDINARY_URL;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
export const TOKEN_KEY = process.env.TOKEN_KEY;
export const EMAIL_ROOT = process.env.EMAIL_ROOT;
export const EMAIL_ROOT_PASS = process.env.EMAIL_ROOT_PASS;