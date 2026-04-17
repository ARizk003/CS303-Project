const nodemailer = require("nodemailer");  
const crypto     = require("crypto");      

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashOtp(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

function validatePassword(password) {
//   if (!password || password.length < 8) {
//     return { valid: false, msg: "Password must be at least 8 characters." };
//   }
//   if (!/[A-Z]/.test(password)) {
//     return { valid: false, msg: "Password must contain at least one uppercase letter." };
//   }
//   if (!/[a-z]/.test(password)) {
//     return { valid: false, msg: "Password must contain at least one lowercase letter." };
//   }
//   if (!/[0-9]/.test(password)) {
//     return { valid: false, msg: "Password must contain at least one number." };
//   }
//   if (!/[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?]/.test(password)) {
//     return { valid: false, msg: "Password must contain at least one special character." };
//   }
  return { valid: true };
}

async function sendOtpEmail(email, otp) {
  await transporter.sendMail({
    from: `"LearnNova" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background: #4CAF50; padding: 24px; text-align: center;">
          <h2 style="color: #fff; margin: 0;">LearnNova</h2>
          <p style="color: #e8f5e9; margin: 4px 0 0;">Password Reset</p>
        </div>
        <div style="padding: 32px; text-align: center;">
          <p style="font-size: 16px; color: #333;">We received a request to reset your password.</p>
          <p style="font-size: 14px; color: #666;">Your One-Time Password (OTP) is:</p>
          <div style="font-size: 40px; font-weight: bold; letter-spacing: 10px; color: #4CAF50; margin: 20px 0;">
            ${otp}
          </div>
          <p style="font-size: 13px; color: #999;">This code expires in <strong>10 minutes</strong>.</p>
          <p style="font-size: 13px; color: #999;">If you didn't request this, you can safely ignore this email.</p>
        </div>
        <div style="background: #f5f5f5; padding: 16px; text-align: center;">
          <p style="font-size: 12px; color: #aaa; margin: 0;">© ${new Date().getFullYear()} LearnNova. All rights reserved.</p>
        </div>
      </div>
    `
  });
}


async function sendPasswordChangedEmail(email) {
  await transporter.sendMail({
    from: `"LearnNova" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your password has been changed",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #4CAF50;">Password Changed Successfully</h2>
        <p>Your LearnNova account password was just changed.</p>
        <p>If you did <strong>not</strong> make this change, please contact support immediately.</p>
        <p style="color: #aaa; font-size: 12px;">Time: ${new Date().toUTCString()}</p>
      </div>
    `
  });
}

module.exports = {
  generateOtp,
  hashOtp,
  validatePassword,
  sendOtpEmail,
  sendPasswordChangedEmail
};