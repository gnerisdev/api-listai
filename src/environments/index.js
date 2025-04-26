import { config } from 'dotenv';

config();

export const PORT = process.env.PORT;
export const TOKEN_KEY = process.env.TOKEN_KEY;
export const EMAIL_ROOT = process.env.EMAIL_ROOT;
export const EMAIL_ROOT_PASS = process.env.EMAIL_ROOT_PASS;

// Mercado Pago
export const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

// Cloudinary
export const CLOUDINARY_NAME_1 = process.env.CLOUDINARY_NAME_1;
export const CLOUDINARY_KEY_1 = process.env.CLOUDINARY_KEY_1;
export const CLOUDINARY_SECRET_1 = process.env.CLOUDINARY_SECRET_1;
export const CLOUDINARY_NAME_2 = process.env.CLOUDINARY_NAME_2;
export const CLOUDINARY_KEY_2 = process.env.CLOUDINARY_KEY_2;
export const CLOUDINARY_SECRET_2 = process.env.CLOUDINARY_SECRET_2;
export const CLOUDINARY_NAME_3 = process.env.CLOUDINARY_NAME_3;
export const CLOUDINARY_KEY_3 = process.env.CLOUDINARY_KEY_3;
export const CLOUDINARY_SECRET_3 = process.env.CLOUDINARY_SECRET_3;
export const CLOUDINARY_NAME_4 = process.env.CLOUDINARY_NAME_4;
export const CLOUDINARY_KEY_4 = process.env.CLOUDINARY_KEY_4;
export const CLOUDINARY_SECRET_4 = process.env.CLOUDINARY_SECRET_4;