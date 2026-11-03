import { Termii } from '@davidbolaji/termii-node';

export const sendSms = async ({ to, message }) => {
  const client = new Termii(process.env.TERMII_API_KEY);

  const response = await client.message.sendMessage({
    to: to,
    from: process.env.TERMII_SENDER_ID,
    sms: message,
    type: 'plain',
    channel: 'dnd', // Use 'dnd' for transactional/critical messages
  });

  return response;
};
