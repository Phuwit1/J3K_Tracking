// smsService.js
const twilio = require('twilio');

async function sendSMS(to, message) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = new twilio(accountSid, authToken);

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,  // หมายเลขโทรศัพท์ Twilio ที่ใช้งาน
      to: to,  // หมายเลขโทรศัพท์ผู้รับ
    });

    console.log('SMS sent successfully:', result.sid);
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
}

module.exports = { sendSMS };
