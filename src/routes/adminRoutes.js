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
import ServicesController from '../controllers/admin/ServicesController.js';
import EventGuestsController from '../controllers/admin/EventGuestsController.js';
import EventMessagesController from '../controllers/admin/EventMessagesController.js';

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
const servicesController = new ServicesController();
const eventGuestsController = new EventGuestsController();
const eventMessagesController = new EventMessagesController();

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
router.get('/events/:event_id', adminAuthMiddleware, eventsController.getEvent);
router.put('/events/:event_id', adminAuthMiddleware, eventsController.updatedEvent);
// Event Types
router.get('/event-types', adminAuthMiddleware, eventTypesController.getEventTypes);
router.get('/event-types-with-categories', adminAuthMiddleware, eventTypesController.getEventTypesWithCategories);
router.post('/event-types', adminAuthMiddleware, upload.single('image'), eventTypesController.addEventType);
router.put('/event-types/:event_type_id', adminAuthMiddleware, upload.single('image'), eventTypesController.updateEventType);
router.delete('/event-types/:event_type_id', adminAuthMiddleware, eventTypesController.deleteEventType);
// Event Categories
router.get('/event-categories', adminAuthMiddleware, eventCategoriesController.getCategories);
router.post('/event-categories', adminAuthMiddleware, eventCategoriesController.createCategory);
router.put('/event-categories/:event_category_id', adminAuthMiddleware, eventCategoriesController.updateCategory);
router.delete('/event-categories/:event_category_id', adminAuthMiddleware, eventCategoriesController.deleteCategory);
// Event Messages
router.get('/events/:event_id/messages', adminAuthMiddleware, eventMessagesController.getMessages);
router.delete('/events/:event_id/messages/:message_id', adminAuthMiddleware, eventMessagesController.removeMessage);
// Event Guests
router.get('/events/:event_id/guests', adminAuthMiddleware, eventGuestsController.getConfirmPresence);
router.put('/events/:event_id/guests/:guest_id', adminAuthMiddleware, eventGuestsController.saveGuest);
router.post('/events/:event_id/guests', adminAuthMiddleware, eventGuestsController.saveGuest);
router.delete('/events/:event_id/guests/:guest_id', adminAuthMiddleware, eventGuestsController.removeGuest);
// Gifts
router.get('/gifts', adminAuthMiddleware, giftsController.getGifts);
router.get('/gifts/categories', adminAuthMiddleware, giftsController.getGiftsByCategory);
router.get('/gifts/:gift_id', adminAuthMiddleware, giftsController.getGift);
router.post('/gifts', adminAuthMiddleware, upload.single('image'), giftsController.create);
router.put('/gifts/:id', adminAuthMiddleware,  upload.single('image'), giftsController.updateGift);
router.delete('/gifts/:id', adminAuthMiddleware, giftsController.removeGift);
// Services
router.get('/services', adminAuthMiddleware, servicesController.getServices);
router.get('/services/types', adminAuthMiddleware, servicesController.getServiceTypes);
router.get('/services/:service_id', adminAuthMiddleware, servicesController.getService);
router.post('/services', adminAuthMiddleware, servicesController.create);
router.put('/services/:service_id', adminAuthMiddleware, servicesController.update);
router.delete('/services/:service_id', adminAuthMiddleware, servicesController.remove);

export default router;
