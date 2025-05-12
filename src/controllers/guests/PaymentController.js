import prisma from '#prisma';
import { LogUtils } from '../../utils/LogUtils.js';
import { MercadoPagoService } from '../../services/MercadoPagoService.js';

class PaymentController {
  async initiatePayment(req, res) {
    try {
      const { items, guestContact, guestName, eventId } = req.body;

      // Get gifts
      const eventGifts = await prisma.event_gifts.findMany({
        where: { event_id: eventId, gift_id: { in: items.map(item => item.id) } },
        include: { gift: true }
      });

      const gifts = eventGifts.map(eventGift => {
        const gift = eventGift.gift;
        const current = items.filter(item => item.id === gift.id)[0];
        return { ...gift, quantity: current.quantity };
      });

      // Get total
      const total = gifts.reduce((prev, current) => {
        return prev += (current.price * current.quantity);
      }, 0);

      // Create transition
      let guestTransition;
      await prisma.$transaction(async () => {
        guestTransition = await prisma.guest_transitions.create({
          data: {
            guest_name: guestName,
            guest_contact: guestContact,
            event_id: eventId,
            total_price: total,
            reference: '',
            status: 'PENDING'
          }
        });

        await prisma.guest_transition_items.createMany({
          data: gifts.map(gift => ({
            guest_transition_id: guestTransition.id,
            gift_id: gift.id,
            quantity: gift.quantity,
            gift_name: gift.name,
            unit_price: gift.price
          }))
        });
      });

      if (!guestTransition) {
        return res.status(200).json({ success: false, message: 'Erro ao gerar transição.' });
      }

      // Reference
      const reference = `guest_transition_${guestTransition.id}`;
      await prisma.guest_transitions.update({
        where: { id: guestTransition.id },
        data: { reference }
      });

      // Generate Preference Mercado Livre
      const mpItems = gifts?.map(item => ({
        title: item.name,
        description: item.description,
        unit_price: item.price,
        quantity: item.quantity,
        currency_id: 'BRL'
      }));

      const mercadoPagoService = new MercadoPagoService();
      const preference = await mercadoPagoService.getPreference({
        items: mpItems,
        back_urls: {
          success: 'https://localhost:3001/users/service-package',
          failure: 'http://localhost:3001/users/service-package',
          pending: 'http://localhost:3001/users/service-package'
        },
        external_reference: reference,
        auto_return: 'approved'
      });

      return res.status(200).json({ success: true, paymentLink: preference.init_point });
    } catch (error) {
      console.log(error);
      LogUtils.errorLogger(error);
      return res.status(500).json({ success: false, message: 'Erro ao serviços' });
    }
  }

  async refreshPaymentStatus(req, res) {

  }
}

export default PaymentController;
