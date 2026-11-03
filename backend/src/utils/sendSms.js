export const sendSms = async ({ to, message }) => {
  try {
    // 🛡️ SAFEGUARD: Force format to 234XXXXXXXXXX and remove invalid numbers
    const validNumbers = to
      .map(num => {
        let p = String(num).replace(/\D/g, ''); // Remove all non-digits
        if (p.startsWith('0')) p = '234' + p.slice(1); // Convert 080... to 23480...
        return p;
      })
      .filter(p => p.length === 13); // Termii ONLY accepts 13-digit Nigerian numbers

    // If no valid numbers remain, don't bother calling the API
    if (validNumbers.length === 0) {
      console.log('⚠️ TERMII: No valid 13-digit phone numbers to send to.');
      return;
    }

    const response = await fetch('https://api.ng.termii.com/api/sms/send/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: process.env.TERMII_API_KEY,
        to: validNumbers, // 👈 Using the strictly filtered array
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
