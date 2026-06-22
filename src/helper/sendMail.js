import nodemailer from "nodemailer";

export const sendMail = async (emailTemplate) => {
  const { emailTo, subject, message, attachments } = emailTemplate;

  // const transporter = nodemailer.createTransport({
  //   host: "smtp.office365.com",
  //   port: 587,
  //   secure: false,
  //   auth: {
  //     user: process.env.OutlookUser,
  //     pass: process.env.OutlookPassword,
  //   },
  //   tls: {
  //     ciphers: "SSLv3",
  //   },
  // });

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: Array.isArray(emailTo) ? emailTo.join(", ") : emailTo,
    subject,
    html: message,
    attachments,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to: ${mailOptions.to}`, info.response);
  } catch (error) {
    console.error("Email sending failed:", error);
  }
};

export default sendMail;
