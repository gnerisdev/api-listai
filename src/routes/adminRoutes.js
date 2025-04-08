import { Router } from 'express';
import { GiftsController } from '../controllers/admin/GiftsController.js';
import ManageUsersController from '../controllers/admin/ManageUsersController.js';
import EventsController from '../controllers/admin/EventsController.js';

const router = Router();

const giftsController = new GiftsController(); 
const manageUsersController = new ManageUsersController(); 
const eventsController = new EventsController(); 

// Gifts
router.get('/gifts', giftsController.getGifts);
router.post('/gifts', giftsController.registerGift);
router.put('/gifts/:id', giftsController.updateGift);
router.delete('/gifts/:id', (req, res) => giftsController.removeGift(req, res))
// Users
router.get('/users', manageUsersController.listUsers);
router.get('/users/:user_id', manageUsersController.getUser);
router.get('/user-events/:user_id', manageUsersController.getUserEvents);
// Events
router.get('/events', eventsController.getEvents);
router.get('/event-details/:event_id', eventsController.getDetails);

export default router;
