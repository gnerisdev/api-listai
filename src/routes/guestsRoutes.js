import { Router } from 'express';
import EventController from '../controllers/guests/EventController.js';
import PaymentController from '../controllers/guests/PaymentController.js';

const router = Router();
const eventController = new EventController();
const paymentController = new PaymentController();

router.get('/event/:slug', eventController.getEvent);
router.post('/message/:event_id', eventController.sendMessage);
router.post('/confirmation/:event_id', eventController.confirmPresence);
router.post('/purchase', paymentController.initiatePayment);

export default router;