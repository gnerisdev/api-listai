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

// Auth
router.post('/register', authController.register);
router.post('/login', authController.login);

// Public
router.get('/event-types', authController.getEventTypes);
router.get('/event-categories', authController.getEventCategories);
router.get('/fetch-gifts-slug', authController.fetchGiftsSlug);

// Webhook Mercado pago
router.post('/webhook/mercadopago', servicesController.paymentNotificationMercadoPago);

// Protected Routes
router.get('/me', userAuthMiddleware, userController.fetchUserProfile);
router.get('/event/:event_id', userAuthMiddleware, eventController.getEvent);
router.put('/event/:event_id', userAuthMiddleware, eventController.updateEvent);
router.get('/event-details/:event_id', userAuthMiddleware, eventDetailsController.getDetails);
router.put('/event-details/:event_id', userAuthMiddleware, eventDetailsController.updateDetails);
router.get('/gifts/:event_id', userAuthMiddleware, giftsController.getGifts);
router.post('/gifts/suggestion/:event_id', userAuthMiddleware, giftsController.addGiftSuggestion);
router.delete('/gifts/:event_id/:gift_id', userAuthMiddleware, giftsController.removeGift);
router.get('/event-settings/:event_id', userAuthMiddleware, eventSettingsController.getSettings);
router.put('/', userAuthMiddleware, eventSettingsController.update);
router.post('/event-gallery/:event_id', userAuthMiddleware, upload.single('file'), galleryController.addMedia);
router.get('/event-gallery/:event_id', userAuthMiddleware, galleryController.getGallery);
router.get('/services', userAuthMiddleware, servicesController.getServices);
router.post('/services/purchase', userAuthMiddleware, servicesController.initiatePayment);
router.get('/guests/:event_id', userAuthMiddleware, eventGuestsController.getConfirmPresence);
router.put('/guests/:event_id/:guest_id', userAuthMiddleware, eventGuestsController.saveGuest);
router.post('/guests/:event_id', userAuthMiddleware, eventGuestsController.saveGuest);
router.delete('/guests/:event_id/:guest_id', userAuthMiddleware, eventGuestsController.removeGuest);
router.get('/messages/:event_id', userAuthMiddleware, eventMessagesController.getMessages);
router.delete('/messages/:event_id/:message_id', userAuthMiddleware, eventMessagesController.removeMessage);

export default router;
