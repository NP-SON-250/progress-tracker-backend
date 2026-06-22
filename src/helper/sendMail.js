import sgMail from "@sendgrid/mail";
import fs from "fs";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendMail = async ({ emailTo, subject, message, attachments = [] }) => {
  const msg = {
    to: Array.isArray(emailTo) ? emailTo : [emailTo],
    from: process.env.FROM_EMAIL,
    subject,
    html: message,
  };

  if (attachments.length > 0) {
    msg.attachments = attachments.map((attachment) => ({
      content: fs.readFileSync(attachment.path).toString("base64"),
      filename: attachment.filename,
      disposition: "inline",
      content_id: attachment.cid,
    }));
  }

  const response = await sgMail.send(msg);

  console.log(`Email sent successfully to ${msg.to}`, response[0].statusCode);

  return response;
};

export default sendMail;
