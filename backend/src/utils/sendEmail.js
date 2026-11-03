import nodemailer from 'nodemailer';

export const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Use SSL
    family: 4,    // 👈 THIS IS THE MAGIC FIX: Forces IPv4 to prevent Render timeouts
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Must be a 16-character App Password
    },
    // Fail after 10 seconds instead of hanging forever
    connectionTimeout: 10000, 
    greetingTimeout: 10000,
    socketTimeout: 20000,
  });

  const mailOptions = {
    from: `"JIBWIS Portal" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  await transporter.sendMail(mailOptions);
};
