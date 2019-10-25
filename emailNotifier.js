require('dotenv').config();
const userEmail = process.env.USER_EMAIL;
const nodemailer = require('nodemailer');

const sendNotificationEmail = async (id) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.USER_EMAIL_PASSWORD,
    },
  });

  return await transporter.sendMail({
    from: `"immobot 👻" <${userEmail}>`, // sender address
    to: `${userEmail}`, // list of receivers
    subject: 'MESSAGE SENT', // Subject line
    html: `message sent to contact for <a href="https://www.immobilienscout24.de/expose/${id}">this url</a>`, // html body
  });
};

module.exports = {
  sendNotificationEmail,
};
