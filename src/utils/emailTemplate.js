import sendMail from "../helper/sendMail.js";
import path from "path";
const currentYear = new Date().getFullYear();

//1. User Welcome Email
export const sendWelcomeMessage = async (email, fullname, password) => {
  const createDetailRow = (label, value) => `
    <table width="100%" style="border-bottom:1px solid #333; margin:8px 0; padding-bottom:6px; font-size:13px;">
      <tr>
        <td align="left" style="color:#cccccc;">${label}</td>
        <td align="right" style="color:#cccccc;">${value}</td>
      </tr>
    </table>
  `;

  const emailTemplate = {
    emailTo: email,
    subject: "Welcome to PTC!",
    message: `
    <div style="font-family: Arial, sans-serif; width:100%; text-align:center;">
      <table style="width:100%; max-width:600px; margin:auto; background:#ffffff; border-radius:8px; overflow:hidden; border:1px solid #e0e0e0;">
        <tr>
          <td style="background:#ffffff; padding:5px; border-bottom:1px solid #e0e0e0;">
            <img src="cid:zamaraLogowhtBg" alt="Zamara Logo" style="height:38px; object-fit:contain;" />
          </td>
        </tr>

        <tr>
          <td style="background:#2c3e50; padding:25px; color:#cccccc; text-align:left; border-radius:8px;">

            <p style="font-size:16px; margin-bottom:10px;">
              Dear <strong>${fullname}</strong>,
            </p>

            <p style="font-size:13px; line-height:1.6; margin-bottom:25px; color:#dcdcdc;">
              Welcome to <strong>PTC</strong>! We are delighted to have you join our community.<br/>
              Below are your registration details:
            </p>

            <div style="background:#111; color:#fff; border-radius:8px; padding:20px; margin-bottom:25px; font-size:14px;">
              <p style="font-size:14px; text-decoration:underline; font-weight:bold; text-align:center; margin-bottom:15px;">
                YOUR ACCOUNT DETAILS
              </p>
              ${createDetailRow("Username", email)}
              ${createDetailRow("Full Name", fullname)}
              ${createDetailRow("Password", password)}
            </div>

            <p style="font-size:13px; color:#cccccc;">
              Keep your username <strong>${email}</strong> and password <strong>${password}</strong> safe.
            </p>

            <p style="font-size:14px; color:#dddddd; margin-top:30px;">PTC Notifications Center</p>
            <p style="margin-top:25px; font-size:12px; color:#bbbbbb;">© ${currentYear} Zamara Actuaries, Administrators and Insurance Brokers Ltd</p>

          </td>
        </tr>
      </table>
    </div>
    `,
    attachments: [
      {
        filename: "zamaraLogowhtBg.png",
        path: path.join(process.cwd(), "zamaraLogowhtBg.png"),
        cid: "zamaraLogowhtBg",
      },
    ],
  };

  await sendMail(emailTemplate);
};
//2. OTP Email
export const sendOTP = async (email, fullname, OTP) => {
  const emailTemplate = {
    emailTo: email,
    subject: "PTC OTP Verification Code",
    message: `
    <div style="font-family: Arial, sans-serif; width:100%; text-align:center;">
      <table style="width:100%; max-width:600px; margin:auto; background:#ffffff; border-radius:8px; overflow:hidden; border:1px solid #e0e0e0;">
        <tr>
          <td style="background:#ffffff; padding:5px; border-bottom:1px solid #e0e0e0;">
            <img src="cid:zamaraLogowhtBg" alt="Zamara Logo" style="height:38px; object-fit:contain;" />
          </td>
        </tr>

        <tr>
          <td style="background:#2c3e50; padding:25px; color:#ffffff; text-align:center; border-radius:8px;">
            <p style="font-size:17px;">Dear <strong>${fullname}</strong>,</p>
            <p style="font-size:16px; color:#dddddd; margin-bottom:25px;">
              To complete your verification, use this code:
            </p>

            <div style="background:#000; border:1px solid #fff; padding:10px 50px; display:inline-block; border-radius:6px; margin-bottom:25px; letter-spacing:5px;">
              <h1 style="margin:0; font-size:18px; color:#ffffff;">${OTP}</h1>
            </div>

            <p style="font-size:13px; color:#bbbbbb;">This code is valid for <strong>15 minutes</strong>. Do not share it.</p>
            <p style="font-size:14px; color:#999; margin-top:30px;">PTC Security Team</p>
            <p style="margin-top:25px; font-size:12px; color:#999;">© ${currentYear} Zamara Actuaries, Administrators and Insurance Brokers Ltd</p>
          </td>
        </tr>
      </table>
    </div>
    `,
    attachments: [
      {
        filename: "zamaraLogowhtBg.png",
        path: path.join(process.cwd(), "zamaraLogowhtBg.png"),
        cid: "zamaraLogowhtBg",
      },
    ],
  };

  await sendMail(emailTemplate);
};
