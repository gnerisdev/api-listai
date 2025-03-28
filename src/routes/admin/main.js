import { Router } from 'express';
import { MenuController } from '../../controllers/menu/MenuController.js';
import { CartController } from '../../controllers/menu/CartController.js';

const router = Router();

const menuController = new MenuController(); 
const cartController = new CartController();

router.get('/products/:storeUrl', menuController.getCollections);
router.get('/:storeUrl', menuController.getCompany);
router.get('/:storeUrl/order/:orderId', menuController.getOrder);
router.post('/estimateValue', cartController.estimateValue);
router.post('/delivery-type', cartController.setDeliveryType);
router.post('/add-client-data', cartController.addClientData);
router.post('/add-address-data', cartController.addAddressData);
router.post('/payment', cartController.getPaymentOptions);
router.post('/calculateFreight', cartController.calculateFreight);
router.post('/finish', cartController.finishOrder);

export default router;