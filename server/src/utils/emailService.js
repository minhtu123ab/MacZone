import nodemailer from "nodemailer";
import EmailLog from "../models/EmailLog.model.js";

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Send forgot password email
export const sendForgotPasswordEmail = async (user, code) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"MacZone E-Commerce" <${
        process.env.EMAIL_FROM || process.env.SMTP_USER
      }>`,
      to: user.email,
      subject: "Reset Your Password - MacZone",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .code-box { background: white; border: 2px dashed #667eea; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
            .code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
            .warning { color: #e74c3c; font-size: 14px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Reset Your Password</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${user.full_name || user.email}</strong>,</p>
              <p>We received a request to reset your password. Use the code below to proceed:</p>
              
              <div class="code-box">
                <p style="margin: 0; font-size: 14px; color: #666;">Your verification code is:</p>
                <p class="code">${code}</p>
                <p style="margin: 0; font-size: 14px; color: #666;">Valid for 5 minutes</p>
              </div>
              
              <p>If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
              
              <div class="warning">
                ⚠️ For security reasons, this code will expire in 5 minutes.
              </div>
            </div>
            <div class="footer">
              <p>© 2024 MacZone E-Commerce. All rights reserved.</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Reset Your Password - MacZone
        
        Hello ${user.full_name || user.email},
        
        We received a request to reset your password. 
        Your verification code is: ${code}
        
        This code is valid for 5 minutes.
        
        If you didn't request this, please ignore this email.
        
        © 2024 MacZone E-Commerce
      `,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    // Log email
    await EmailLog.create({
      user_id: user._id,
      email_type: "forgot_password",
      subject: mailOptions.subject,
      content: `Verification code: ${code}`,
      status: "sent",
      sent_at: new Date(),
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    // Log failed email
    await EmailLog.create({
      user_id: user._id,
      email_type: "forgot_password",
      subject: "Reset Your Password - MacZone",
      content: `Failed to send verification code`,
      status: "failed",
      sent_at: new Date(),
    });

    console.error("Email send error:", error);
    throw new Error("Failed to send email");
  }
};

// Send order success email (for future use)
export const sendOrderSuccessEmail = async (user, order) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"MacZone E-Commerce" <${
        process.env.EMAIL_FROM || process.env.SMTP_USER
      }>`,
      to: user.email,
      subject: `Order Confirmation #${order._id} - MacZone`,
      html: `
        <h1>Order Confirmed!</h1>
        <p>Thank you for your order, ${user.full_name || user.email}!</p>
        <p>Order ID: ${order._id}</p>
        <p>Total: ${order.total_price} VND</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    await EmailLog.create({
      user_id: user._id,
      email_type: "order_success",
      subject: mailOptions.subject,
      content: `Order #${order._id} confirmed`,
      status: "sent",
      sent_at: new Date(),
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    await EmailLog.create({
      user_id: user._id,
      email_type: "order_success",
      subject: `Order Confirmation #${order._id}`,
      content: "Failed to send order confirmation",
      status: "failed",
      sent_at: new Date(),
    });

    console.error("Email send error:", error);
    return { success: false, error: error.message };
  }
};
