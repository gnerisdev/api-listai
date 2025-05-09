import { Router } from 'express';
import MercadoPagoController from '../controllers/webhooks/MercadoPagoController.js';

const router = Router();
const mercadoPagoController = new MercadoPagoController();

// Webhook Mercado pago
router.post('/mercadopago', mercadoPagoController.paymentNotification);

export default router;
