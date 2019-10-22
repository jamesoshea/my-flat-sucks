const nodemailer = require('nodemailer');

const sendMessage = async () => {
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
    to: 'jamesoshea89@hotmail.com', // list of receivers
    subject: 'Hello ✔', // Subject line
    text: 'Hello world?', // plain text body
    html: '<b>Hello world?</b>', // html body
  });
};

module.exports = {
  sendMessage,
};
