const nodemailer = require('nodemailer');

const sendEmail = async options => {

    const  transport = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "ddc3324a62d564",
          pass: "0afff5d2e576c1"
        }
      });

      const mailOptions = {
        from: 'admin <admin@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message
      }

    await transport.sendMail(mailOptions);

}
module.exports = sendEmail;