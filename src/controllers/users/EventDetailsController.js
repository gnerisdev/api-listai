import { PrismaClient } from '@prisma/client';
import { LogUtils } from '../../utils/LogUtils.js';
import { ValidationUtils } from '../../utils/ValidationUtils.js';

const prisma = new PrismaClient();

class EventDetailsController {
  async getDetails(req, res) {
    try {
      const userId = parseInt(req.headers.user_id);
      const eventId = parseInt(req.params.event_id);

      // Validation
      if (!userId || !eventId) {
        return res.status(400).json({ success: false, message: 'Parâmetros ausentes ou inválidos.' });
      }

      // Verify user permission event
      const event = await prisma.users_events.findFirst({
        where: { user_id: userId, event_id: eventId },
        include: { event: true },
      });

      if (!event) {
        return res.status(404).json({ success: false, message: 'Evento não encontrado.' });
      }

      const eventDetails = await prisma.event_details.findFirst({ where: { event_id: eventId } });
      const eventDetailsData = {
        date: new Date(eventDetails.event_date).toISOString().split('T')[0], 
        startTime: new Date(eventDetails.start_time).toTimeString().slice(0, 5),
        endTime: new Date(eventDetails.end_time).toTimeString().slice(0, 5),
        eventType: eventDetails.event_type,
        eventLocation: eventDetails.event_location,
        postalCode: eventDetails.postal_code,
        fullAddress: eventDetails.full_address,
        latitude: eventDetails.latitude,
        longitude: eventDetails.longitude,
        transmission: eventDetails.transmission,
        transmissionLink: eventDetails.transmission_link,
        transmissionPassword: eventDetails.transmission_password
      };

      return res.status(200).json({
        success: true,
        message: 'Detalhes do evento recuperados com sucesso!',
        eventDetails: eventDetailsData,
      });
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao recuperar os detalhes do evento.'
      });
    }
  }

  async updateDetails(req, res) {
    try {
      const userId = parseInt(req.headers.user_id);
      const eventId = parseInt(req.params.event_id);
      const {
        date,
        startTime,
        endTime,
        eventType,
        eventLocation,
        postalCode,
        fullAddress,
        transmissionLink,
        transmissionPassword
      } = req.body;

      let messages = [];

      // Validate time format
      const startTimeValidation = ValidationUtils.hours(startTime);
      const endTimeValidation = ValidationUtils.hours(endTime);
      if (startTimeValidation !== true) messages.push(startTimeValidation);
      if (endTimeValidation !== true) messages.push(endTimeValidation);

      // Validate required fields
      if (!userId) messages.push('Usuário não fornecido.');
      if (!eventId) messages.push('ID do evento não fornecido.');
      if (!date || isNaN(new Date(date))) messages.push('Data do evento inválida.');

      // Ensure start time is before end time
      if (new Date(startTime) >= new Date(endTime)) {
        messages.push('A hora de início não pode ser posterior ou igual à hora de término.');
      }

      // Validate event type
      if (!eventType || !['in-person', 'virtual'].includes(eventType)) {
        messages.push('Tipo de evento inválido.');
      }

      // Additional validation based on event type
      if (eventType === 'in-person') {
        if (!eventLocation) messages.push('Local do evento vázio.');
        if (!fullAddress) messages.push('Endereço inválido.');
      }

      if (eventType === 'virtual') {
        if (!transmissionLink || !/^https?:\/\/[^\s]+$/.test(transmissionLink)) {
          messages.push('Link de transmissão inválido.');
        }
      }

      // If there are validation errors, return them
      if (messages.length > 0) {
        return res.status(400).json({
          success: false,
          message: `${messages.map(error => `• ${error}`).join('\n <br>')}`
        });
      }

      // Check if the event exists
      const event = await prisma.users_events.findFirst({
        where: { user_id: userId, event_id: eventId },
        include: { event: true },
      });

      if (!event) {
        return res.status(404).json({ success: false, message: 'Evento não encontrado.' });
      }

      // Check if event details already exist
      const existingDetail = await prisma.event_details.findFirst({ where: { event_id: eventId } });
      const dataDetails = {
        event_id: eventId,
        event_date: new Date(date),
        start_time: new Date(`${date}T${startTime}:00.000Z`),
        end_time: new Date(`${date}T${endTime}:00.000Z`),
        event_type: eventType,
        event_location: eventType === 'in-person' ? eventLocation : null,
        postal_code: postalCode,
        full_address: eventType === 'in-person' ? fullAddress : null,
        transmission_link: eventType === 'virtual' ? transmissionLink : null,
        transmission_password: eventType === 'virtual' ? transmissionPassword : null,
      };

      if (existingDetail) {
        // Update existing event details
        const updatedEventDetail = await prisma.event_details.update({
          where: { id: existingDetail.id },
          data: dataDetails
        });

        return res.status(200).json({
          success: true,
          message: 'Detalhes do evento atualizados com sucesso!',
          eventDetail: updatedEventDetail,
        });
      } else {
        const createdEventDetail = await prisma.event_details.create({ data: dataDetails });

        return res.status(200).json({
          success: true,
          message: 'Detalhes do evento criados com sucesso!',
          eventDetail: createdEventDetail,
        });
      }
    } catch (error) {
      console.log(error);
      LogUtils.errorLogger(error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao salvar detalhes do evento.'
      });
    }
  }


}

export default EventDetailsController;
