import prisma from '#prisma';
import moment from 'moment-timezone';
import { LogUtils } from '../../utils/LogUtils.js';
import { MercadoPagoService } from '../../services/MercadoPagoService.js';
import { MathUtils } from '../../utils/MathUtils.js';

class PaymentController {
  async initiatePayment(req, res) {
    try {
      const { items, email, name, eventId } = req.body;

      if (items.length <= 0) {
         return res.status(400).json({ 
          success: false,
          message: 'Carrinho vazio!' 
        });
      }

      // Get gifts and settings
      const [eventGifts, settings] = await Promise.all([
        prisma.event_gifts.findMany({
          where: { 
            event_id: eventId, 
            gift_id: { in: items.map(item => item.id) },
          },
          include: { gift: true, event: { select: { slug: true } } }
        }),
        prisma.settings.findFirst({ select: { percentage_gift: true } })
      ]);

      const gifts = eventGifts.map(eventGift => {
        const gift = eventGift.gift;
        const current = items.filter(item => item.id === gift.id)[0];
        return { ...gift, quantity: current.quantity };
      });

      const giftIds = gifts.map(item => item.id);
      if (giftIds.length !== giftIds.length) {
        return res.status(400).json({
          success: false,
          message: 'Erro ao calcular transação.'
        });
      }

      // Get total
      const percentage = settings.percentage_gift;

      const total = gifts.reduce((prev, current) => {
        const priceWithPercentage = MathUtils.addPercentage(current.price, percentage);
        return prev += (priceWithPercentage * current.quantity);
      }, 0);

      const userAmount = gifts.reduce((prev, current) => {
        return prev += (current.price * current.quantity);
      }, 0);

      if (!Number.isFinite(total) || total <= 0) {
        return res.status(400).json({ 
          success: false,
          message: 'Erro ao calcular o total da transição.' 
        });
      }
      
      // Create transaction 
      let reference;

      await prisma.$transaction(async (tx) => {
        const eventGiftTransaction = await tx.event_gift_transactions.create({
          data: {
            guest_contact: '',
            guest_name: name,
            guest_email: email,
            event_id: eventId,
            total_price: total,
            user_amount: userAmount,
            percentage: percentage,
            reference: '',
            status: 'PENDING',
            created_at: moment().tz('America/Sao_Paulo').toISOString(),
          },
        });

        // Update reference
        reference = `guest_transaction_${eventGiftTransaction.id}`;
        await tx.event_gift_transactions.update({
          where: { id: eventGiftTransaction.id },
          data: { reference: reference },
        });

        // Update gifts unavailable
        await tx.event_gifts.updateMany({
          where: { gift_id: { in: giftIds } },
          data: { is_available: false },
        });
      });

      // Generate Preference Mercado Livre
      const mpItems = gifts?.map(item => ({
        id: item.id,
        title: item.name,
        description: item.description,
        unit_price: MathUtils.addPercentage(item.price, percentage),
        picture_url: item?.image_url,
        quantity: item.quantity,
        currency_id: 'BRL'
      }));

      const mercadoPagoService = new MercadoPagoService();

      const preference = await mercadoPagoService.getPreference({
        items: mpItems,
        payer: { email, first_name: name },
        back_urls: {
          success: `https://site.listai.com.br/page/checkout-success/${eventGifts[0].event.slug}`,
          failure: `https://site.listai.com.br/page/checkout-success`,
          pending: `https://site.listai.com.br/page/checkout-success`
        },
        external_reference: reference,
        auto_return: 'approved',
        binary_mode: true
      });

      return res.status(200).json({ success: true, paymentLink: preference.init_point });
    } catch (error) {
      console.log(error);
      LogUtils.errorLogger(error);
      return res.status(500).json({ success: false, message: 'Erro ao serviços' });
    }
  }
}

export default PaymentController;
