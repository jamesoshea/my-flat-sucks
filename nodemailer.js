const nodemailer = require('nodemailer');

const sendMessage = async (id) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.USER_EMAIL, // generated ethereal user
      pass: process.env.USER_EMAIL_PASSWORD, // generated ethereal password
    },
  });

  await transporter.sendMail({
    from: '"immobot 👻" <iamveryrad@gmail.com>', // sender address
    to: 'iamveryrad@gmail.com', // list of receivers
    subject: 'MESSAGE SENT', // Subject line
    html: `message sent to contact for <a href="https://www.immobilienscout24.de/expose/${id}">this url</a>`, // html body
  });
};

module.exports = {
  sendMessage,
};
