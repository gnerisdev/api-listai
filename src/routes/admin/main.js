import { Router } from 'express';
import { GiftsController } from '../../controllers/admin/GiftsController.js';

const router = Router();

const giftsController = new GiftsController(); 

router.get('/admin/gifts', giftsController.getGifts);

export default router;