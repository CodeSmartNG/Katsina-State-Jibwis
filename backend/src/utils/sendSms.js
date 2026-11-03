export const sendSms = async ({ to, message }) => {
  try {
    // Ensure all phone numbers are strings and properly formatted for Termii
    const formattedTo = to.map(num => String(num).trim());

    const response = await fetch('https://api.ng.termii.com/api/sms/send/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: process.env.TERMII_API_KEY,
        to: formattedTo, // Must be an array of strings
        from: process.env.TERMII_SENDER_ID,
        sms: message,
        type: 'plain',
        channel: 'dnd', // Transactional route
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // 👇 THIS WILL PRINT THE EXACT REASON FROM TERMII TO YOUR RENDER LOGS
      console.error('🚨 TERMII API ERROR DETAILS:', JSON.stringify(data, null, 2));
      throw new Error(data.message || 'Termii API failed');
    }

    console.log(`✅ SMS sent via Termii! Message ID: ${data.message_id}`);
    return data;
  } catch (error) {
    console.error('🚨 SEND SMS FAILED:', error.message);
    throw error;
  }
};
