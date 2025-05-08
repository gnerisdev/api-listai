process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { v2 as cloudinary } from 'cloudinary';
import {
  CLOUDINARY_NAME_1, CLOUDINARY_KEY_1, CLOUDINARY_SECRET_1,
  CLOUDINARY_NAME_2, CLOUDINARY_KEY_2, CLOUDINARY_SECRET_2,
  CLOUDINARY_NAME_3, CLOUDINARY_KEY_3, CLOUDINARY_SECRET_3,
  CLOUDINARY_NAME_4, CLOUDINARY_KEY_4, CLOUDINARY_SECRET_4,
} from '../environments/index.js';

const cloudinaryAccounts = [
  {
    cloud_name: CLOUDINARY_NAME_1,
    api_key: CLOUDINARY_KEY_1,
    api_secret: CLOUDINARY_SECRET_1,
  },
  {
    cloud_name: CLOUDINARY_NAME_2,
    api_key: CLOUDINARY_KEY_2,
    api_secret: CLOUDINARY_SECRET_2,
  },
  {
    cloud_name: CLOUDINARY_NAME_3,
    api_key: CLOUDINARY_KEY_3,
    api_secret: CLOUDINARY_SECRET_3,
  },
  {
    cloud_name: CLOUDINARY_NAME_4,
    api_key: CLOUDINARY_KEY_4,
    api_secret: CLOUDINARY_SECRET_4,
  },
];

export class CloudinaryService {
  static getCloudinaryAccountByWeek() {
    const today = new Date();
    const weekOfMonth = Math.ceil(today.getDate() / 7);
    const index = (weekOfMonth - 1) % cloudinaryAccounts.length;
    return cloudinaryAccounts[index];
  }

  static getInstance() {
    const selectedAccount = this.getCloudinaryAccountByWeek();

    cloudinary.config({
      cloud_name: selectedAccount.cloud_name,
      api_key: selectedAccount.api_key,
      api_secret: selectedAccount.api_secret,
    });

    return cloudinary;
  }

  static getAccountIndexOfWeek() {
    const today = new Date();
    const weekOfMonth = Math.ceil(today.getDate() / 7);
    return  '0' + (weekOfMonth - 1) % cloudinaryAccounts.length;
  }  

  static async getPublicId(url) {  
    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname; 
    const parts = pathname.split('/');      
    const publicIdWithExt = parts.slice(2).join('/');
    const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');
  
    return publicId;
  }
}
