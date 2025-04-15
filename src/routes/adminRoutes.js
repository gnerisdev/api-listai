import { Router } from 'express';
import adminAuthMiddleware from '../middleware/adminAuthMiddleware.js';
import GiftsController from '../controllers/admin/GiftsController.js';
import AuthController from '../controllers/admin/AuthController.js';
import GuestController from '../controllers/admin/GuestController.js';
import ManageUsersController from '../controllers/admin/ManageUsersController.js';
import EventsController from '../controllers/admin/EventsController.js';
import AdminController from '../controllers/admin/AdminController.js';

const router = Router();

const giftsController = new GiftsController();
const manageUsersController = new ManageUsersController();
const eventsController = new EventsController();
const authController = new AuthController();
const adminController = new AdminController();

// Public Routes
router.post('/login', authController.login);

// Protected Routes
router.get('/me', adminAuthMiddleware, adminController.fetchAdmin);
router.get('/users', adminAuthMiddleware, manageUsersController.listUsers);
router.get('/users/:user_id', adminAuthMiddleware, manageUsersController.getUser);
router.get('/user-events/:user_id', adminAuthMiddleware, manageUsersController.getUserEvents);
router.get('/events', adminAuthMiddleware, eventsController.getEvents);
router.get('/event-details/:event_id', adminAuthMiddleware, eventsController.getDetails);
router.get('/gifts', adminAuthMiddleware, giftsController.getGifts);
router.post('/gifts', adminAuthMiddleware, giftsController.registerGift);
router.put('/gifts/:id', adminAuthMiddleware, giftsController.updateGift);
router.delete('/gifts/:id', adminAuthMiddleware, giftsController.removeGift);
router.get('/event-guests/:eventId', GuestController.getGuestsEvents);

export default router;
