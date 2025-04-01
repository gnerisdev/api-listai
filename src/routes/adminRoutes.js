import { Router } from 'express';
import { GiftsController } from '../controllers/admin/GiftsController.js';
import ManageUsersController from '../controllers/admin/ManageUsersController.js';

const router = Router();

const giftsController = new GiftsController(); 
const manageUsersController = new ManageUsersController(); 

router.get('/gifts', giftsController.getGifts);
router.get('/users', manageUsersController.listUsers);
router.get('/users/:user_id', manageUsersController.getUser);
router.get('/user-events/:user_id', manageUsersController.getUserEvents);

export default router;