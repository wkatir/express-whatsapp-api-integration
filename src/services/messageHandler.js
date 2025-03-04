import whatsappService from './whatsappService.js';
import appendToSheet from "./googleSheetsService.js"

class MessageHandler {

  constructor() {
    this.appointmentState = {};
  }

  async handleIncomingMessage(message, senderInfo) {
    if (message?.type === 'text') {
      const incomingMessage = message.text.body.toLowerCase().trim();

      if (this.isGreeting(incomingMessage)) {
        await this.sendWelcomeMessage(message.from, message.id, senderInfo);
        await this.sendWelcomeMenu(message.from);
      } else if (incomingMessage === "media") {
        await this.sendMedia(message.from);
      } else if (this.appointmentState[message.from]) {
        await this.handleAppointmentFlow(message.from, incomingMessage);
      } else {
        await this.handleMenuOption(message.from, incomingMessage);
      }
      await whatsappService.markAsRead(message.id);
    } else if (message?.type === "interactive") {
      const option = message?.interactive?.button_reply?.id;
      await this.handleMenuOption(message.from, option);
      await whatsappService.markAsRead(message.id);
    }
  }

  isGreeting(message) {
    const greetings = ["hola", "hello", "hi", "buenas tardes"];
    return greetings.includes(message);
  }

  getSenderName(senderInfo) {
    return senderInfo?.profile?.name || senderInfo?.wa_id || "Usuario";
  }

  async sendWelcomeMessage(to, messageId, senderInfo) {
    const name = this.getSenderName(senderInfo);
    const welcomeMessage = `Hola ${name}, Bienvenido, Tu tienda en línea. ¿En qué puedo ayudarte hoy?`;
    await whatsappService.sendMessage(to, welcomeMessage, messageId);
  }

  async sendWelcomeMenu(to) {
    const menuMessage = "Elige una Opción"
    const buttons = [
      {
        type: 'reply', reply: { id: 'option_1', title: 'Agendar' }
      },
      {
        type: 'reply', reply: { id: 'option_2', title: 'Consultar' }
      },
      {
        type: 'reply', reply: { id: 'option_3', title: 'Ubicación' }
      }
    ];

    await whatsappService.sendInteractiveButtons(to, menuMessage, buttons);
  }

  async handleMenuOption(to, option) {
    let response;

    switch (option) {
      case 'option_1':
        this.appointmentState[to] = { step: "name" }
        response = 'Por favor, ingresa tu nombre:';
        break;
      case 'option_2':
        response = 'Realiza tu consulta';
        break;
      case 'option_3':
        response = 'Esta es nuestra Ubicación';
        break;
      default:
        response = 'Lo siento, no entendí tu selección, por favor elige una de las opciones disponibles.';
        break;
    }

    await whatsappService.sendMessage(to, response);
  }

  async sendMedia(to) {
    const mediaUrl = "https://s3.amazonaws.com/gndx.dev/medpet-audio.aac";
    const caption = "Bienvenida";
    const type = "audio";
    await whatsappService.sendMediaMessage(to, type, mediaUrl, caption);
  }

  completeAppointment(to) {
    const appointment = this.appointmentState[to];
    delete this.appointmentState[to];

    const userData = [
      to,
      appointment.name,
      appointment.email,
      appointment.reason,
      new Date().toISOString()
    ]
    
    appendToSheet(userData);

    return `Gracias por agendar tu cita.
    Resumen de tu cita:
    Nombre: ${appointment.name}
    Email: ${appointment.email}
    Razón: ${appointment.reason}
    Nos pondremos en contacto contigo pronto, para confirmar
    `;

  }

  async handleAppointmentFlow(to, message) {
    const state = this.appointmentState[to];
    let response;
  
    switch (state.step) {
      case 'name':
        state.name = message;
        state.step = 'email';
        response = "Por favor, indíquenos su dirección de correo electrónico.";
        break;
      case 'email':
        state.email = message;
        state.step = 'reason';
        response = "¿Cuál es el motivo de su consulta?";
        break;
      case 'reason':
        state.reason = message;
        response = this.completeAppointment(to);
        break;
      default:
        response = "Lo sentimos, se ha producido un error en el flujo. Por favor, inténtelo nuevamente.";
        break;
    }
    await whatsappService.sendMessage(to, response);
  }
  


}

export default new MessageHandler();