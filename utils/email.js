const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  //   console.log('option:', options);
  //1.Creater a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      password: process.env.EMAIL_PASSWORD,
    },
    //activate gmail is less secure application for production application
  });
  //2.Define the email options
  const mailOptions = {
    from: 'Aditya <adityabharti154@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  console.log(mailOptions);
  // //3.Actually send the email

  // transporter.sendMail(mailOptions).then((info) => {
  //   return resizeBy.status(201).json({
  //     status:"success",
  //     message:"you should recieve an email"
  //   })
  // }).catch(error => {
  //   return res.status(500).json({
  //     error
  //   })
  // });
  // try {
  //   await transporter.sendMail(mailOptions);
  //   console.log('Email sent successfully!');
  // } catch (error) {
  //   console.error('Error sending email:', error);
  //   throw error; // Propagate the error up for handling in the calling function
  // }
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};
module.exports = sendEmail;
