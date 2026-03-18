import nodemailer from "nodemailer";

/**
 * Email service for order confirmations and notifications
 *
 * Supports:
 * - Gmail (with app password)
 * - SendGrid
 * - Custom SMTP
 */

const createTransporter = () => {
  const emailService = process.env.EMAIL_SERVICE || "gmail";

  if (emailService === "sendgrid") {
    // SendGrid
    return nodemailer.createTransport({
      host: "smtp.sendgrid.net",
      port: 587,
      auth: {
        user: "apikey",
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  }

  // Gmail (default)
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // App password, not regular password
    },
  });
};

let transporter = null;

try {
  transporter = createTransporter();
} catch (error) {
  console.warn("⚠️  Email service not configured. Emails will not be sent.");
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmation(email, order) {
  if (!transporter) {
    console.warn("Email service not configured, skipping confirmation email");
    return;
  }

  try {
    const itemsHtml = order.cartItems
      .map((item) => `<li>${item.name} x${item.quantity} = KSh ${(item.price * item.quantity).toFixed(2)}</li>`)
      .join("");

    const mailOptions = {
      from: process.env.EMAIL_USER || "noreply@dropshop.local",
      to: email,
      subject: `Order Confirmed - #${order._id}`,
      html: `
        <h1>✅ Order Confirmed!</h1>
        <p>Hi ${order.customerDetails.fullName},</p>
        <p>Thank you for your order. Here are the details:</p>
        
        <h2>Order Details</h2>
        <ul>
          <li><strong>Order ID:</strong> ${order._id}</li>
          <li><strong>Total:</strong> KSh ${order.totalPrice.toFixed(2)}</li>
          <li><strong>Status:</strong> ${order.fulfillmentStatus}</li>
        </ul>
        
        <h2>Items</h2>
        <ul>${itemsHtml}</ul>
        
        <h2>Shipping To</h2>
        <p>
          ${order.customerDetails.fullName}<br/>
          ${order.customerDetails.addressLine1}<br/>
          ${order.customerDetails.city}, ${order.customerDetails.state} ${order.customerDetails.postalCode}<br/>
          ${order.customerDetails.country}
        </p>
        
        <p>You will receive a tracking number via email once your order ships.</p>
        <p>Thank you for shopping with us!</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Order confirmation sent to ${email}`);
  } catch (error) {
    console.error("❌ Failed to send order confirmation:", error.message);
  }
}

/**
 * Send payment notification
 */
export async function sendPaymentConfirmation(email, mpesaData, order) {
  if (!transporter) return;

  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || "noreply@dropshop.local",
      to: email,
      subject: `Payment Received - #${order._id}`,
      html: `
        <h1>💰 Payment Received!</h1>
        <p>Hi ${order.customerDetails.fullName},</p>
        <p>Your M-Pesa payment has been confirmed.</p>
        
        <h2>Payment Details</h2>
        <ul>
          <li><strong>Amount:</strong> KSh ${mpesaData.amount}</li>
          <li><strong>Receipt:</strong> ${mpesaData.mpesaReceiptNumber}</li>
          <li><strong>Date:</strong> ${mpesaData.mpesaTransactionDate}</li>
        </ul>
        
        <p>Your order is now being processed. You will receive shipping updates soon.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Payment confirmation sent to ${email}`);
  } catch (error) {
    console.error("❌ Failed to send payment confirmation:", error.message);
  }
}

/**
 * Send shipping notification
 */
export async function sendShippingNotification(email, trackingNumber, order) {
  if (!transporter) return;

  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || "noreply@dropshop.local",
      to: email,
      subject: `Your Order Has Shipped! 📦 - #${order._id}`,
      html: `
        <h1>📦 Your Order Has Shipped!</h1>
        <p>Hi ${order.customerDetails.fullName},</p>
        <p>Great news! Your order is on the way.</p>
        
        <h2>Tracking Information</h2>
        <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
        <p>You can track your package using this number on the supplier's website.</p>
        
        <p>Thank you for your business!</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Shipping notification sent to ${email}`);
  } catch (error) {
    console.error("❌ Failed to send shipping notification:", error.message);
  }
}
