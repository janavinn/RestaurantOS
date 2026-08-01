"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendInviteEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
// Configure the transporter with environment variables
// Make sure to add EMAIL_USER and EMAIL_PASS to your .env file
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'placeholder@gmail.com',
        pass: process.env.EMAIL_PASS || 'placeholder_app_password',
    },
});
const sendInviteEmail = async (to, restaurantName, inviteUrl) => {
    const mailOptions = {
        from: process.env.EMAIL_USER || 'admin@restaurantos.com',
        to,
        subject: `Invitation to join ${restaurantName} on RestaurantOS`,
        html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #1e293b;">You've been invited!</h2>
        <p style="color: #475569; font-size: 16px;">
          You have been invited to join <strong>${restaurantName}</strong> as a staff member on RestaurantOS.
        </p>
        <p style="color: #475569; font-size: 16px;">
          Please click the button below to set up your account and password.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${inviteUrl}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Accept Invitation
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 14px;">
          If the button doesn't work, copy and paste this link into your browser:<br/>
          <a href="${inviteUrl}" style="color: #6366f1;">${inviteUrl}</a>
        </p>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 40px;">
          This link will expire in 24 hours.
        </p>
      </div>
    `
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return true;
    }
    catch (error) {
        console.error('Error sending email:', error);
        // If the email fails (e.g. because credentials aren't set up yet), we'll log it but not crash
        return false;
    }
};
exports.sendInviteEmail = sendInviteEmail;
//# sourceMappingURL=email.js.map