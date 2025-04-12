import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class GuestController {
    static async getGuestsEvents(req, res) {
        try {
            const {eventId}= req.params
            console.log("Rota acessada! eventId:", eventId);

            if(!eventId || isNaN(parseInt(eventId))){
                console.log("ID inválido!");
                return res.status(400).json({
                    success: false,
                    message: "Id inválido",
                    data: []
                })
            }

            /*const guests = await prisma.event_guests.findMany({
                where: {event_id: parseInt(eventId) },
                orderBy: {created_at: "desc"}
            })
            */
           const guests = await prisma.event_guests.findMany({
                where:{event_id:parseInt(eventId)},
                include:{
                    event:{
                        select:{
                            id: true,
                            title: true,
                            subtitle: true,
                            slug: true,
                            location: true,
                            description: true,
                            active: true
                            
                        }
                    }
                },
                orderBy: { created_at: "desc" }
           })
            console.log("Resultado da busca:", guests);

            return res.status(200).json({
                success: true,
                message: "Convidados encontado com sucesso!",
                data: guests
            
            })
            
        } catch (error) {
            console.error('Error na lista de convidados:', error);
            res.status(500).json({
                success: false,
                message: 'Falha ao recuperar eventos de convidados',
                error: error.message
            });
        }
    }
}
export default GuestController;
