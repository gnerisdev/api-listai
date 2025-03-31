import { Router } from 'express';
import AuthController from '../controllers/users/AuthController.js';
import UserController from '../controllers/users/UserController.js';
import userAuthMiddleware from '../middleware/userAuthMiddleware.js';
import EventController from '../controllers/users/EventController.js';

const router = Router();
const authController = new AuthController();
const userController = new UserController();
const eventController = new EventController();

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
router.get('/event-details/:event_id', userAuthMiddleware, eventController.getEventDetails);
router.post('/event-details/', userAuthMiddleware, eventController.createEventDetails);

export default router;
