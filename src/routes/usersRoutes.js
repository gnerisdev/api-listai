import { Router } from 'express';
import multer from 'multer';
import userAuthMiddleware from '../middleware/userAuthMiddleware.js';
import AuthController from '../controllers/users/AuthController.js';
import UserController from '../controllers/users/UserController.js';
import EventController from '../controllers/users/EventController.js';
import EventDetailsController from '../controllers/users/EventDetailsController.js';
import GiftsController from '../controllers/users/GiftsController.js';
import EventSettingsController from '../controllers/users/EventSettingsController.js';
import GalleryController from '../controllers/users/GalleryController.js';
import ServicesController from '../controllers/users/ServicesController.js';
import EventGuestsController from '../controllers/users/EventGuestsController.js';
import EventMessagesController from '../controllers/users/EventMessagesController.js';
import GiftsReceivedController from '../controllers/users/GiftsReceivedController.js';
import DashboardController from '../controllers/users/DashboardController.js';
import PreUserRequestsController from '../controllers/users/PreUserRequestsController.js';

const router = Router();
const upload = multer({ dest: 'tmp/' });
const authController = new AuthController();
const userController = new UserController();
const eventController = new EventController();
const eventDetailsController = new EventDetailsController();
const giftsController = new GiftsController();
const eventSettingsController = new EventSettingsController();
const galleryController = new GalleryController();
const servicesController = new ServicesController();
const eventGuestsController = new EventGuestsController();
const eventMessagesController = new EventMessagesController();
const giftsReceivedController = new GiftsReceivedController();
const dashboardController = new DashboardController();
const preUserRequestsController = new PreUserRequestsController();

// Authentication Routes
router.post('/pre-register', preUserRequestsController.saveUser);
router.post('/pre-register/get', preUserRequestsController.getUserRequest);
router.post('/pre-register/generate-payment', preUserRequestsController.generatePayment);
router.post('/pre-register/event-info', preUserRequestsController.saveEventInfo);
router.post('/register', authController.register);
router.post('/login', authController.login);

// Public Routes (Accessible without authentication)
router.get('/event-types', authController.getEventTypes);
router.get('/event-categories', authController.getEventCategories);
router.get('/fetch-gifts-slug', authController.fetchGiftsSlug);

// Protected Routes (Require authentication - userAuthMiddleware)

// User Routes
router.get('/me', userAuthMiddleware, userController.fetchUserProfile);

// Event Routes
router.get('/event/:event_id', userAuthMiddleware, eventController.getEvent);
router.put('/event/:event_id', userAuthMiddleware, eventController.updateEvent);
router.post('/event/:event_id/upload/:type', userAuthMiddleware, upload.single('file'), eventController.uploadImage);

// Event Details Routes
router.get('/event-details/:event_id', userAuthMiddleware, eventDetailsController.getDetails);
router.put('/event-details/:event_id', userAuthMiddleware, eventDetailsController.updateDetails);

// Gifts Routes
router.get('/gifts/:event_id', userAuthMiddleware, giftsController.getGifts);
router.post('/gifts/suggestion/:event_id', userAuthMiddleware, giftsController.addGiftSuggestion);
router.delete('/gifts/:event_id/:gift_id', userAuthMiddleware, giftsController.removeGift);

// Event Settings 
router.get('/event/:event_id/settings', userAuthMiddleware, eventSettingsController.getSettings);
router.put('/event/:event_id/settings', userAuthMiddleware, eventSettingsController.update); 

// Event Gallery Routes
router.post('/event-gallery/:event_id', userAuthMiddleware, upload.single('file'), galleryController.addMedia);
router.get('/event-gallery/:event_id', userAuthMiddleware, galleryController.getGallery);
router.delete('/event-gallery/:event_id/media/:media_id', userAuthMiddleware, galleryController.removeMedia);

// Services Routes
router.get('/events/:event_id/services', userAuthMiddleware, servicesController.getServices);
router.post('/services/purchase', userAuthMiddleware, servicesController.initiatePayment);
router.get('/events/:event_id/pending-payment-services', userAuthMiddleware, servicesController.getPendingPaymentServices);

// Event Guests Routes
router.get('/guests/:event_id', userAuthMiddleware, eventGuestsController.getConfirmPresence);
router.put('/guests/:event_id/:guest_id', userAuthMiddleware, eventGuestsController.saveGuest);
router.post('/guests/:event_id', userAuthMiddleware, eventGuestsController.saveGuest);
router.delete('/guests/:event_id/:guest_id', userAuthMiddleware, eventGuestsController.removeGuest);

// Event Messages Routes
router.get('/messages/:event_id', userAuthMiddleware, eventMessagesController.getMessages);
router.delete('/messages/:event_id/:message_id', userAuthMiddleware, eventMessagesController.removeMessage);

// Received Gifts Routes
router.get('/events/:event_id/received-gifts', userAuthMiddleware, giftsReceivedController.getReceived);
router.get('/events/:event_id/transactions', userAuthMiddleware, giftsReceivedController.getTransactions);
router.get('/events/:event_id/payout-requests', userAuthMiddleware, giftsReceivedController.createPayoutRequest);

// Dashboard
router.get('/event/:event_id/dashboard/retrieve', userAuthMiddleware, dashboardController.retrieveEventData);

export default router;