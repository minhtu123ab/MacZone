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

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// Format date
const formatDate = (date) => {
  return new Date(date).toLocaleString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Send order confirmation email (when order is created)
export const sendOrderConfirmationEmail = async (user, order, orderItems) => {
  try {
    const transporter = createTransporter();

    // Generate order items HTML
    const itemsHTML = orderItems
      .map(
        (item) => `
      <tr>
        <td style="padding: 15px; border-bottom: 1px solid #eee;">
          <div style="display: flex; align-items: center;">
            <img src="${
              item.product_id?.thumbnail_url ||
              item.variant_id?.image_url ||
              "https://via.placeholder.com/80"
            }" 
                 alt="${item.product_name}" 
                 style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-right: 15px;">
            <div>
              <h3 style="margin: 0 0 5px 0; font-size: 16px; color: #333;">${
                item.product_name
              }</h3>
              <p style="margin: 0; color: #666; font-size: 14px;">
                ${item.variant_color} - ${item.variant_storage}
              </p>
              <p style="margin: 5px 0 0 0; color: #999; font-size: 14px;">
                Số lượng: ${item.quantity}
              </p>
            </div>
          </div>
        </td>
        <td style="padding: 15px; border-bottom: 1px solid #eee; text-align: right;">
          <p style="margin: 0; font-size: 16px; font-weight: bold; color: #667eea;">
            ${formatCurrency(item.price)}
          </p>
          <p style="margin: 5px 0 0 0; color: #999; font-size: 14px;">
            = ${formatCurrency(item.price * item.quantity)}
          </p>
        </td>
      </tr>
    `
      )
      .join("");

    const mailOptions = {
      from: `"MacZone E-Commerce" <${
        process.env.EMAIL_FROM || process.env.SMTP_USER
      }>`,
      to: user.email,
      subject: `✅ Xác nhận đơn hàng #${order._id
        .toString()
        .slice(-6)
        .toUpperCase()} - MacZone`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 0; }
            .container { max-width: 650px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0 0 10px 0; font-size: 28px; }
            .header p { margin: 0; opacity: 0.9; font-size: 16px; }
            .content { padding: 30px; }
            .order-info { background: #f9f9f9; border-radius: 10px; padding: 20px; margin: 20px 0; }
            .order-info-row { display: flex; justify-content: space-between; margin: 10px 0; }
            .order-info-row strong { color: #667eea; }
            .section-title { font-size: 20px; font-weight: bold; color: #333; margin: 30px 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #667eea; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .total-section { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
            .total-row { display: flex; justify-content: space-between; margin: 10px 0; }
            .total-amount { font-size: 24px; font-weight: bold; }
            .info-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { background: #f9f9f9; padding: 30px; text-align: center; color: #666; font-size: 14px; }
            .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; font-weight: bold; }
            @media only screen and (max-width: 600px) {
              .container { margin: 0; border-radius: 0; }
              .content { padding: 20px; }
              .header { padding: 30px 20px; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Đặt Hàng Thành Công!</h1>
              <p>Cảm ơn bạn đã tin tưởng MacZone</p>
            </div>
            
            <div class="content">
              <p>Xin chào <strong>${order.customer_name}</strong>,</p>
              <p>Chúng tôi đã nhận được đơn hàng của bạn và đang xử lý. Dưới đây là chi tiết đơn hàng:</p>
              
              <div class="order-info">
                <div class="order-info-row">
                  <span>📦 Mã đơn hàng:</span>
                  <strong>#${order._id
                    .toString()
                    .slice(-6)
                    .toUpperCase()}</strong>
                </div>
                <div class="order-info-row">
                  <span>📅 Ngày đặt:</span>
                  <strong>${formatDate(order.createdAt)}</strong>
                </div>
                <div class="order-info-row">
                  <span>💳 Phương thức thanh toán:</span>
                  <strong>${
                    order.payment_method === "COD"
                      ? "Thanh toán khi nhận hàng (COD)"
                      : order.payment_method === "banking"
                      ? "Chuyển khoản ngân hàng"
                      : "Thẻ tín dụng"
                  }</strong>
                </div>
                <div class="order-info-row">
                  <span>📍 Trạng thái:</span>
                  <strong style="color: #ffc107;">Đang xử lý</strong>
                </div>
              </div>

              <h2 class="section-title">📦 Sản phẩm đã đặt</h2>
              <table class="items-table">
                <tbody>
                  ${itemsHTML}
                </tbody>
              </table>

              <div class="total-section">
                <div class="total-row">
                  <span>Tổng tiền hàng:</span>
                  <span>${formatCurrency(order.total_price)}</span>
                </div>
                <div class="total-row">
                  <span>Phí vận chuyển:</span>
                  <span>Miễn phí</span>
                </div>
                <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.3); margin: 10px 0;">
                <div class="total-row total-amount">
                  <span>Tổng thanh toán:</span>
                  <span>${formatCurrency(order.total_price)}</span>
                </div>
              </div>

              <h2 class="section-title">🚚 Thông tin giao hàng</h2>
              <div class="order-info">
                <div class="order-info-row">
                  <span>👤 Người nhận:</span>
                  <strong>${order.customer_name}</strong>
                </div>
                <div class="order-info-row">
                  <span>📞 Số điện thoại:</span>
                  <strong>${order.phone_number}</strong>
                </div>
                <div class="order-info-row">
                  <span>📍 Địa chỉ:</span>
                  <strong>${order.shipping_address}</strong>
                </div>
                ${
                  order.note
                    ? `
                <div class="order-info-row">
                  <span>📝 Ghi chú:</span>
                  <strong>${order.note}</strong>
                </div>
                `
                    : ""
                }
              </div>

              ${
                order.payment_method === "banking"
                  ? `
              <div class="info-box">
                <strong>⚠️ Lưu ý thanh toán chuyển khoản:</strong>
                <p style="margin: 10px 0 0 0;">
                  Vui lòng chuyển khoản <strong>CHÍNH XÁC</strong> số tiền <strong>${formatCurrency(
                    order.total_price
                  )}</strong> vào tài khoản sau:<br><br>
                  <strong>🏦 Ngân hàng:</strong> Vietcombank<br>
                  <strong>👤 Chủ tài khoản:</strong> CONG TY MACZONE<br>
                  <strong>💳 Số tài khoản:</strong> <span style="font-size: 18px; color: #667eea; font-family: monospace;">1234567890</span><br>
                  <strong>📝 Nội dung chuyển khoản:</strong> <span style="font-size: 16px; color: #667eea; font-family: monospace;">${
                    order.transfer_reference ||
                    "MZ" + order._id.toString().slice(-10).toUpperCase()
                  }</span><br><br>
                  <em style="color: #666; font-size: 13px;">⏱️ Thời gian xử lý: 1-24 giờ sau khi chuyển khoản</em>
                </p>
              </div>
              `
                  : ""
              }

              <div style="text-align: center;">
                <a href="${
                  process.env.CLIENT_URL || "http://localhost:3000"
                }/orders/${order._id}" class="button">
                  Xem Chi Tiết Đơn Hàng
                </a>
              </div>

              <p style="margin-top: 30px; color: #666; font-size: 14px;">
                Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email hoặc hotline: <strong>1900-xxxx</strong>
              </p>
            </div>

            <div class="footer">
              <p style="margin: 0 0 10px 0;"><strong>MacZone E-Commerce</strong></p>
              <p style="margin: 0;">© 2024 MacZone. All rights reserved.</p>
              <p style="margin: 10px 0 0 0; color: #999;">Email này được gửi tự động, vui lòng không trả lời.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        XÁC NHẬN ĐỢN HÀNG - MACZONE
        
        Xin chào ${order.customer_name},
        
        Chúng tôi đã nhận được đơn hàng của bạn!
        
        Mã đơn hàng: #${order._id.toString().slice(-6).toUpperCase()}
        Ngày đặt: ${formatDate(order.createdAt)}
        Tổng tiền: ${formatCurrency(order.total_price)}
        
        Người nhận: ${order.customer_name}
        Số điện thoại: ${order.phone_number}
        Địa chỉ: ${order.shipping_address}
        
        Phương thức thanh toán: ${order.payment_method}
        
        Xem chi tiết: ${
          process.env.CLIENT_URL || "http://localhost:3000"
        }/orders/${order._id}
        
        Cảm ơn bạn đã mua hàng tại MacZone!
        
        © 2024 MacZone E-Commerce
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    // Log email
    await EmailLog.create({
      user_id: user._id,
      email_type: "order_confirmation",
      subject: mailOptions.subject,
      content: `Order #${order._id} confirmation sent`,
      status: "sent",
      sent_at: new Date(),
    });

    console.log(`✅ Order confirmation email sent to ${user.email}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    // Log failed email
    await EmailLog.create({
      user_id: user._id,
      email_type: "order_confirmation",
      subject: `Order Confirmation #${order._id}`,
      content: "Failed to send order confirmation",
      status: "failed",
      sent_at: new Date(),
    });

    console.error("❌ Order confirmation email error:", error);
    return { success: false, error: error.message };
  }
};

// Send order completed email (when order is delivered successfully)
export const sendOrderCompletedEmail = async (user, order, orderItems) => {
  try {
    const transporter = createTransporter();

    // Generate order items HTML (simplified for completed email)
    const itemsHTML = orderItems
      .map(
        (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <strong>${item.product_name}</strong>
          <br>
          <span style="color: #666; font-size: 14px;">${item.variant_color} - ${
          item.variant_storage
        }</span>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          ${formatCurrency(item.price * item.quantity)}
        </td>
      </tr>
    `
      )
      .join("");

    const mailOptions = {
      from: `"MacZone E-Commerce" <${
        process.env.EMAIL_FROM || process.env.SMTP_USER
      }>`,
      to: user.email,
      subject: `🎊 Giao hàng thành công #${order._id
        .toString()
        .slice(-6)
        .toUpperCase()} - MacZone`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 0; }
            .container { max-width: 650px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0 0 10px 0; font-size: 28px; }
            .header p { margin: 0; opacity: 0.9; font-size: 16px; }
            .success-icon { font-size: 60px; margin-bottom: 20px; }
            .content { padding: 30px; }
            .order-info { background: #f6ffed; border-left: 4px solid #52c41a; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .order-info-row { display: flex; justify-content: space-between; margin: 10px 0; }
            .section-title { font-size: 20px; font-weight: bold; color: #333; margin: 30px 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #52c41a; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .items-table th { background: #f9f9f9; padding: 10px; text-align: left; border-bottom: 2px solid #52c41a; }
            .highlight-box { background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%); color: white; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center; }
            .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 10px 5px; font-weight: bold; }
            .footer { background: #f9f9f9; padding: 30px; text-align: center; color: #666; font-size: 14px; }
            @media only screen and (max-width: 600px) {
              .container { margin: 0; border-radius: 0; }
              .content { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="success-icon">✅</div>
              <h1>Giao Hàng Thành Công!</h1>
              <p>Đơn hàng của bạn đã được giao thành công</p>
            </div>
            
            <div class="content">
              <p>Xin chào <strong>${order.customer_name}</strong>,</p>
              <p>Chúng tôi xin thông báo đơn hàng của bạn đã được giao <strong>thành công</strong> và hoàn tất! 🎉</p>
              
              <div class="order-info">
                <div class="order-info-row">
                  <span>📦 Mã đơn hàng:</span>
                  <strong>#${order._id
                    .toString()
                    .slice(-6)
                    .toUpperCase()}</strong>
                </div>
                <div class="order-info-row">
                  <span>📅 Ngày đặt hàng:</span>
                  <strong>${formatDate(order.createdAt)}</strong>
                </div>
                <div class="order-info-row">
                  <span>✅ Ngày hoàn thành:</span>
                  <strong>${formatDate(order.updatedAt)}</strong>
                </div>
                ${
                  order.tracking_code
                    ? `
                <div class="order-info-row">
                  <span>🚚 Mã vận đơn:</span>
                  <strong>${order.tracking_code}</strong>
                </div>
                `
                    : ""
                }
              </div>

              <div class="highlight-box">
                <h2 style="margin: 0 0 10px 0;">Cảm ơn bạn đã tin tưởng MacZone! 🙏</h2>
                <p style="margin: 0; font-size: 16px;">
                  Chúng tôi hy vọng bạn hài lòng với sản phẩm và dịch vụ của chúng tôi.
                </p>
              </div>

              <h2 class="section-title">📦 Sản phẩm đã nhận</h2>
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th style="text-align: center;">Số lượng</th>
                    <th style="text-align: right;">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                  <tr style="background: #f9f9f9; font-weight: bold;">
                    <td colspan="2" style="padding: 15px; text-align: right;">Tổng cộng:</td>
                    <td style="padding: 15px; text-align: right; color: #52c41a; font-size: 18px;">
                      ${formatCurrency(order.total_price)}
                    </td>
                  </tr>
                </tbody>
              </table>

              <h2 class="section-title">💬 Đánh giá sản phẩm</h2>
              <p>Chia sẻ trải nghiệm của bạn để giúp chúng tôi cải thiện dịch vụ tốt hơn!</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${
                  process.env.CLIENT_URL || "http://localhost:3000"
                }/orders/${order._id}" class="button">
                  Đánh Giá Sản Phẩm
                </a>
                <a href="${
                  process.env.CLIENT_URL || "http://localhost:3000"
                }/products" class="button">
                  Tiếp Tục Mua Sắm
                </a>
              </div>

              <div style="background: #e6f7ff; border-left: 4px solid #1890ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <strong>🎁 Ưu đãi đặc biệt cho bạn!</strong>
                <p style="margin: 10px 0 0 0;">
                  Sử dụng mã <strong style="color: #1890ff;">CUSTOMER10</strong> để được giảm 10% cho đơn hàng tiếp theo!
                </p>
              </div>

              <p style="margin-top: 30px; color: #666; font-size: 14px;">
                Nếu có bất kỳ vấn đề nào với đơn hàng, vui lòng liên hệ với chúng tôi trong vòng 7 ngày để được hỗ trợ đổi trả.<br>
                <strong>Hotline:</strong> 1900-xxxx | <strong>Email:</strong> support@maczone.vn
              </p>
            </div>

            <div class="footer">
              <p style="margin: 0 0 10px 0;"><strong>MacZone E-Commerce</strong></p>
              <p style="margin: 0;">Cảm ơn bạn đã là khách hàng của chúng tôi! ❤️</p>
              <p style="margin: 10px 0 0 0; color: #999;">© 2024 MacZone. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        GIAO HÀNG THÀNH CÔNG - MACZONE
        
        Xin chào ${order.customer_name},
        
        Đơn hàng của bạn đã được giao thành công!
        
        Mã đơn hàng: #${order._id.toString().slice(-6).toUpperCase()}
        Ngày đặt: ${formatDate(order.createdAt)}
        Ngày hoàn thành: ${formatDate(order.updatedAt)}
        Tổng tiền: ${formatCurrency(order.total_price)}
        
        Cảm ơn bạn đã tin tưởng MacZone!
        
        Đánh giá sản phẩm: ${
          process.env.CLIENT_URL || "http://localhost:3000"
        }/orders/${order._id}
        
        © 2024 MacZone E-Commerce
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    // Log email
    await EmailLog.create({
      user_id: user._id,
      email_type: "order_completed",
      subject: mailOptions.subject,
      content: `Order #${order._id} completed notification sent`,
      status: "sent",
      sent_at: new Date(),
    });

    console.log(`✅ Order completed email sent to ${user.email}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    // Log failed email
    await EmailLog.create({
      user_id: user._id,
      email_type: "order_completed",
      subject: `Order Completed #${order._id}`,
      content: "Failed to send order completed notification",
      status: "failed",
      sent_at: new Date(),
    });

    console.error("❌ Order completed email error:", error);
    return { success: false, error: error.message };
  }
};
