import { Router } from 'express';
import userAuthMiddleware from '../middleware/userAuthMiddleware.js';
import AuthController from '../controllers/users/AuthController.js';
import UserController from '../controllers/users/UserController.js';
import EventController from '../controllers/users/EventController.js';
import EventDetailsController from '../controllers/users/EventDetailsController.js';

const router = Router();
const authController = new AuthController();
const userController = new UserController();
const eventController = new EventController();
const eventDetailsController = new EventDetailsController();

// Auth
router.post('/register', authController.register);
router.post('/login', authController.login);

// Public
router.get('/event-types', authController.getEventTypes);
router.get('/event-categories', authController.getEventCategories);
router.get('/fetch-gifts-slug', authController.fetchGiftsSlug);

// Protected Routes
router.get('/me', userAuthMiddleware, userController.fetchUserProfile);
router.get('/event/:event_id', userAuthMiddleware, eventController.getEvent);
router.put('/event/:event_id', userAuthMiddleware, eventController.updateEvent);
router.get('/event-details/:event_id', userAuthMiddleware, eventDetailsController.getDetails);
router.put('/event-details/:event_id', userAuthMiddleware, eventDetailsController.updateDetails);

export default router;
