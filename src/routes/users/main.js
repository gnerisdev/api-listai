import { Router } from 'express';
import AuthController from '../../controllers/users/AuthController.js';

const authController = new AuthController();
const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/event-types', authController.getEventTypes);
router.get('/event-categories', authController.getEventCategories);
router.get('/fetch-gifts-slug', authController.fetchGiftsSlug);

export default router;
