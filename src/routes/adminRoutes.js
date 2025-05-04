import { Router } from 'express';
import multer from 'multer';
import adminAuthMiddleware from '../middleware/adminAuthMiddleware.js';
import GiftsController from '../controllers/admin/GiftsController.js';
import AuthController from '../controllers/admin/AuthController.js';
import GuestController from '../controllers/admin/GuestController.js';
import ManageUsersController from '../controllers/admin/ManageUsersController.js';
import EventsController from '../controllers/admin/EventsController.js';
import AdminController from '../controllers/admin/AdminController.js';
import EventTypesController from '../controllers/admin/EventTypesController.js';
import EventCategoriesController from '../controllers/admin/EventCategoriesController.js';

const router = Router();
const upload = multer({ dest: 'tmp/' });
const giftsController = new GiftsController();
const manageUsersController = new ManageUsersController();
const eventsController = new EventsController();
const authController = new AuthController();
const adminController = new AdminController();
const guestController = new GuestController();
const eventTypesController = new EventTypesController();
const eventCategoriesController = new EventCategoriesController();

// Public Routes
router.post('/login', authController.login);

// Protected Routes
router.get('/me', adminAuthMiddleware, adminController.fetchAdmin);
// Users
router.get('/users', adminAuthMiddleware, manageUsersController.listUsers);
router.get('/users/:user_id', adminAuthMiddleware, manageUsersController.getUser);
router.get('/user-events/:user_id', adminAuthMiddleware, manageUsersController.getUserEvents);
// Events
router.get('/events', adminAuthMiddleware, eventsController.getEvents);
router.get('/event-details/:event_id', adminAuthMiddleware, eventsController.getDetails);
// Event Types
router.get('/event-types', adminAuthMiddleware, eventTypesController.getEventTypes);
router.get('/event-types-with-categories', adminAuthMiddleware, eventTypesController.getEventTypesWithCategories);
router.post('/event-types', adminAuthMiddleware, upload.single('image'), eventTypesController.addEventType);
router.put('/event-types/:event_type_id', adminAuthMiddleware, upload.single('image'), eventTypesController.updateEventType);
router.delete('/event-types/:event_type_id', adminAuthMiddleware, eventTypesController.deleteEventType);
// Event Categories
router.post('/event-categories', adminAuthMiddleware, eventCategoriesController.createCategory);
router.put('/event-categories/:event_category_id', adminAuthMiddleware, eventCategoriesController.updateCategory);
router.delete('/event-categories/:event_category_id', adminAuthMiddleware, eventCategoriesController.deleteCategory);
// Gifts
router.get('/gifts', adminAuthMiddleware, giftsController.getGifts);
router.post('/gifts', adminAuthMiddleware, giftsController.registerGift);
router.put('/gifts/:id', adminAuthMiddleware, giftsController.updateGift);
router.delete('/gifts/:id', adminAuthMiddleware, giftsController.removeGift);

export default router;
