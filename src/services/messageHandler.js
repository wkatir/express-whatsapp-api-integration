import whatsappService from './whatsappService.js';

class MessageHandler {
  async handleIncomingMessage(message, senderInfo) {
    if (message?.type === 'text') {
      const incomingMessage = message.text.body.toLowerCase().trim();

      if (this.isGreeting(incomingMessage)) {
        await this.sendWelcomeMessage(message.from, message.id, senderInfo);
        await this.sendWelcomeMenu(message.from);
      } else {
        const response = `Echo: ${message.text.body}`;
        await whatsappService.sendMessage(message.from, response, message.id);
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
        response = 'Agendar Cita';
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

}

export default new MessageHandler();