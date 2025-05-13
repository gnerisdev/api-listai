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

      if (!Number.isFinite(total) || total <= 0) {
        return res.status(400).json({ 
          success: false,
          message: 'Erro ao calcular o total da transição.' 
        });
      }

      // Calculate Values
      const systemFee = Math.round(total * 0.10 * 100) / 100;
      const transactionFee = Math.round(total * 0.05 * 100) / 100;
      const userAmount = Math.round((total - systemFee - transactionFee) * 100) / 100;

      // Create transition
      let eventGiftTransactions;
      await prisma.$transaction(async () => {
        eventGiftTransactions = await prisma.event_gift_transactions.create({
          data: {
            guest_name: guestName,
            guest_contact: guestContact,
            event_id: eventId,
            total_price: total,
            transaction_fee: transactionFee,
            system_fee: systemFee,
            user_amount: userAmount,
            reference: '',
            status: 'PENDING'
          }
        });

        await prisma.event_gift_transaction_items.createMany({
          data: gifts.map(gift => ({
            event_gift_transaction_id: eventGiftTransactions.id,
            gift_id: gift.id,
            quantity: gift.quantity,
            gift_name: gift.name,
            unit_price: gift.price
          }))
        });
      });

      if (!eventGiftTransactions) {
        return res.status(200).json({ success: false, message: 'Erro ao gerar transição.' });
      }

      // Reference
      const reference = `guest_transition_${eventGiftTransactions.id}`;
      await prisma.event_gift_transactions.update({
        where: { id: eventGiftTransactions.id },
        data: { reference }
      });

      // Generate Preference Mercado Livre
      const mpItems = gifts?.map(item => ({
        title: item.name,
        description: item.description,
        unit_price: item.price,
        picture_url: item?.image_url,
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
