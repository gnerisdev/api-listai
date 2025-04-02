import { Router } from 'express';
import { GiftsController } from '../../controllers/admin/GiftsController.js';

const router = Router();

const giftsController = new GiftsController(); 

router.get('/gifts', giftsController.getGifts);
router.post('/register-gift', giftsController.registerGift);
router.put('/update-gifts/:id', giftsController.updateGift);
router.delete('/delete-gifts/:id', (req, res) => giftsController.removeGift(req, res))

export default router;
