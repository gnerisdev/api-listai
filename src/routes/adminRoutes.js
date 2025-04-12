import { Router } from 'express';
import { GiftsController } from '../controllers/admin/GiftsController.js';
import ManageUsersController from '../controllers/admin/ManageUsersController.js';
import AuthController from '../controllers/admin/AuthController.js';
import GuestController from '../controllers/admin/GuestController.js';
const router = Router();

const giftsController = new GiftsController(); 
const manageUsersController = new ManageUsersController(); 

// Gifts
router.get('/gifts', giftsController.getGifts);
router.post('/gifts', giftsController.registerGift);
router.put('/gifts/:id', giftsController.updateGift);
router.delete('/gifts/:id', (req, res) => giftsController.removeGift(req, res))

//Login
router.post('/login', AuthController.login);
// Users
router.get('/users', manageUsersController.listUsers);
router.get('/users/:user_id', manageUsersController.getUser);
router.get('/user-events/:user_id', manageUsersController.getUserEvents);

//GuestEvents
router.get('/event-guests/:eventId', GuestController.getGuestsEvents);

export default router;
