import { Router } from 'express';
import EventController from '../controllers/guests/EventController.js';

const router = Router();
const eventController = new EventController();

router.get('/event/:slug', eventController.getEvent);
router.post('/message/:event_id', eventController.sendMessage);
router.post('/confirmation/:event_id', eventController.confirmPresence);

export default router;