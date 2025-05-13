import prisma from "#prisma";
import { LogUtils } from "../../utils/LogUtils.js";
import { FormatUtils } from "../../utils/FormatUtils.js";

class GiftsReceivedController {
  async getReceived(req, res) {
    try {
      const userId = parseInt(req.headers.user_id);
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
            "Evento não encontrado ou você não tem permissão para acessá-lo.",
        });
      }

      // Get received gifts (APPROVED guest transitions with associated items)
      const receivedGifts = await prisma.event_gift_transactions.findMany({
        where: { event_id: eventId, status: "APPROVED" },
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
      console.log(error);
      LogUtils.errorLogger(error);
      return res
        .status(500)
        .json({
          success: false,
          message: "Erro ao buscar lista de presentes recebidos.",
        });
    }
  }

  async getTransactions(req, res) {
    try {
      const userId = parseInt(req.headers.user_id);
      const eventId = parseInt(req.params.event_id);

      // Verify user and event association
      const userEvent = await prisma.users_events.findFirst({
        where: { user_id: userId, event_id: eventId },
        include: { event: true },
      });

      if (!userEvent?.event) {
        return res.status(404).json({
          success: false,
          message: "Evento não encontrado ou você não tem permissão para acessá-lo.",
        });
      }

      const eventGiftTransactions = await prisma.event_gift_transactions.findMany({
        where: { event_id: eventId, status: "APPROVED" },
      });

      const totalReceived = eventGiftTransactions.map(item => item.user_amount);

      return res.status(200).json({
        success: true,
        totalReceived
      });
    } catch (error) {
      console.log(error)
      LogUtils.errorLogger(error);
      return res
        .status(500)
        .json({
          success: false,
          message: "Erro ao buscar lista de presentes recebidos.",
        });
    }
  }
}

export default GiftsReceivedController;
