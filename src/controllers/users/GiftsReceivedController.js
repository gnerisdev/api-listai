import prisma from '#prisma';
import { LogUtils } from '../../utils/LogUtils.js';
import { FormatUtils } from '../../utils/FormatUtils.js';
import { MathUtils } from '../../utils/MathUtils.js';

class GiftsReceivedController {
  async getReceived(req, res) {
    try {
      const userId = parseInt(req.headers['x-user-id']);
      const eventId = parseInt(req.params.event_id);

      // Verify user and event association
      const userEvent = await prisma.users_events.findFirst({
        where: { user_id: userId, event_id: eventId },
        include: { event: true },
      });

      if (!userEvent?.event) {
        return res.status(404).json({
          success: false,
          message:
            'Evento não encontrado ou você não tem permissão para acessá-lo.',
        });
      }

      // Get received gifts (APPROVED guest transitions with associated items)
      const receivedGifts = await prisma.event_gift_transactions.findMany({
        where: { event_id: eventId, status: 'APPROVED' },
        select: {
          guest_name: true,
          guest_contact: true,
          event_id: true,
          status: true,
          user_amount: true,
          created_at: true,
          items: {
            select: {
              gift_name: true,
              quantity: true,
              gift: {
                select: {
                  image_url: true,
                  name: true,
                  description: true,
                },
              },
            },
          },
        },
      });

      return res.status(200).json({
        success: true,
        receivedGifts: FormatUtils.toCamelCase(receivedGifts),
      });
    } catch (error) {
      LogUtils.errorLogger(error);
      return res
        .status(500)
        .json({ success: false, message: 'Erro ao buscar lista de presentes recebidos.' });
    }
  }

  async getTransactions(req, res) {
    try {
      const userId = parseInt(req.headers['x-user-id']);
      const eventId = parseInt(req.params.event_id);

      // Verify user and event association
      const userEvent = await prisma.users_events.findFirst({
        where: { user_id: userId, event_id: eventId },
        include: { event: true },
      });

      if (!userEvent?.event) {
        return res.status(404).json({
          success: false,
          message: 'Evento não encontrado ou você não tem permissão para acessá-lo.',
        });
      }

      const eventGiftTransactions = await prisma.event_gift_transactions.findMany({
        where: { event_id: eventId, status: 'APPROVED' },
      });

      const payouts = await prisma.payout_requests.findMany({
        where: { event_id: eventId, user_id: userId },
      });

      const payoutPaids = payouts.map(item => item.status === 'PAID' ? item.requested_amount : 0);
      const payoutPendings = payouts.map(item => item.status === 'PENDING' ? item.requested_amount : 0);

      const totalPending = MathUtils.sum(payoutPendings);
      const totalReceived = MathUtils.sum(eventGiftTransactions.map(item => item.user_amount));
      const totalTransferred = MathUtils.sum(payoutPaids);
      const totalAvailable = MathUtils.subtract([totalReceived, totalTransferred]);

      return res.status(200).json({
        success: true,
        totalReceived,
        totalTransferred,
        totalAvailable,
        totalPending
      });
    } catch (error) {
      LogUtils.errorLogger(error);
      return res
        .status(500)
        .json({
          success: false,
          message: 'Erro ao buscar lista de presentes recebidos.',
        });
    }
  }

  async createPayoutRequest(req, res) {
    try {
      const userId = parseInt(req.headers['x-user-id']);
      const eventId = parseInt(req.params.event_id);

      // Verify user and event association
      const userEvent = await prisma.users_events.findFirst({
        where: { user_id: userId, event_id: eventId },
        include: { event: true },
      });

      if (!userEvent?.event) {
        return res.status(404).json({
          success: false,
          message: 'Evento não encontrado ou você não tem permissão para acessá-lo.',
        });
      }

      // Calculate total available amount
      const eventGiftTransactions = await prisma.event_gift_transactions.findMany({
        where: { event_id: eventId, status: 'APPROVED' },
      });

      const payouts = await prisma.payout_requests.findMany({
        where: { event_id: eventId, user_id: userId },
      });

      const payoutPaids = payouts.map(item => item.status === 'PAID' ? item.requested_amount : 0);
      const payoutPendings = payouts.map(item => item.status === 'PENDING' ? item.requested_amount : 0);

      const totalPending = MathUtils.sum(payoutPendings);
      const totalReceived = MathUtils.sum(eventGiftTransactions.map(item => item.user_amount));
      const totalTransferred = MathUtils.sum(payoutPaids);
      const totalAvailable = MathUtils.subtract([totalReceived, totalTransferred]);

      if (totalPending > 0) {
        return res.status(400).json({
          success: true,
          message: 'Você já tem um repasse pendente.',
        });
      }

      if (totalAvailable <= 0) {
        return res.status(400).json({
          success: true,
          message: 'Sem valor disponível para solicitar repasse.',
        });
      }

      // Create the payout request with the total available amount
      await prisma.payout_requests.create({
        data: { user_id: userId, event_id: eventId, requested_amount: totalAvailable },
      });

      return res.status(201).json({
        success: true,
        message: 'Solicitação de repasse feita com sucesso.',
      });
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(500).json({
        success: false, message: 'Erro ao criar solicitação de repasse.'
      });
    }
  }
}

export default GiftsReceivedController;
