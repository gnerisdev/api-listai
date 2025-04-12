import { Router } from 'express';
import { GiftsController } from '../controllers/admin/GiftsController.js';
import AuthController from '../controllers/admin/AuthController.js';
import GuestController from '../controllers/admin/GuestController.js';
import ManageUsersController from '../controllers/admin/ManageUsersController.js';
import EventsController from '../controllers/admin/EventsController.js';

const router = Router();

const giftsController = new GiftsController(); 
const manageUsersController = new ManageUsersController(); 
const eventsController = new EventsController(); 
const authController = new AuthController(); 

// Gifts
router.get('/gifts', giftsController.getGifts);
router.post('/gifts', giftsController.registerGift);
router.put('/gifts/:id', giftsController.updateGift);
router.delete('/gifts/:id', giftsController.removeGift)

//Login
router.post('/login', authController.login);
// Users
router.get('/users', manageUsersController.listUsers);
router.get('/users/:user_id', manageUsersController.getUser);
router.get('/user-events/:user_id', manageUsersController.getUserEvents);
// Events
router.get('/events', eventsController.getEvents);
router.get('/event-details/:event_id', eventsController.getDetails);

//GuestEvents
router.get('/event-guests/:eventId', GuestController.getGuestsEvents);

export default router;
