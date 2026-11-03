export const sendSms = async ({ to, message }) => {
  try {
    const response = await fetch('https://api.ng.termii.com/api/sms/send/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: process.env.TERMII_API_KEY,
        to: to, // This must be an array of phone numbers for the bulk endpoint
        from: process.env.TERMII_SENDER_ID,
        sms: message,
        type: 'plain',
        channel: 'dnd', // Transactional channel
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // This will log the exact error from Termii to your Render logs
      console.error('🚨 TERMII API ERROR:', data);
      throw new Error(data.message || 'Termii API failed');
    }

    console.log(`✅ SMS sent via Termii! Message ID: ${data.message_id}`);
    return data;
  } catch (error) {
    console.error('🚨 SEND SMS FAILED:', error.message);
    throw error;
  }
};
