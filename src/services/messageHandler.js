import whatsappService from './whatsappService.js';

class MessageHandler {
  async handleIncomingMessage(message) {
    if (message?.type === 'text') {
      const response = `Echo: ${message.text.body}`;
      await whatsappService.sendMessage(message.from, response, message.id);
      await whatsappService.markAsRead(message.id);
    }
  }

  isGreeting(message) {
    const greetings = ['hi', 'hello', 'hey'];
  }

}

export default new MessageHandler();