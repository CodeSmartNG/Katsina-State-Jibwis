import nodemailer from 'nodemailer';

export const sendEmail = async (options) => {
  // 👇 Changed to explicit Host and Port for Render compatibility
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // MUST be a 16-character App Password
    },
  });

  const mailOptions = {
    from: `"JIBWIS Portal" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  await transporter.sendMail(mailOptions);
};
