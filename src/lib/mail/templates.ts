export const getOrderConfirmationEmail = (orderId: string, totalAmount: number, customerName: string) => `
<div style="font-family: Arial, sans-serif; max-w-2xl mx-auto p-4 text-[#282827]">
  <h1 style="color: #282827;">Thank you for your order, ${customerName}!</h1>
  <p>We've received your order <strong>#${orderId.slice(-6).toUpperCase()}</strong>.</p>
  <p>Your total amount is <strong>₹${(totalAmount / 100).toFixed(2)}</strong>.</p>
  <p>We are currently processing your order and will notify you once it ships.</p>
  <br />
  <p>Best regards,</p>
  <p><strong>Udaya Cycles Team</strong></p>
</div>
`;

export const getOrderStatusUpdateEmail = (orderId: string, status: string, trackingNumber?: string) => {
  let statusMessage = "";
  if (status === "processing") statusMessage = "Your order is now being processed.";
  if (status === "shipped") statusMessage = "Great news! Your order has shipped.";
  if (status === "delivered") statusMessage = "Your order has been delivered! We hope you love it.";
  if (status === "cancelled") statusMessage = "Your order has been cancelled.";

  const trackingHtml = trackingNumber 
    ? `<p>Tracking Number: <strong>${trackingNumber}</strong></p>` 
    : "";

  return `
  <div style="font-family: Arial, sans-serif; max-w-2xl mx-auto p-4 text-[#282827]">
    <h1 style="color: #282827;">Order Update: #${orderId.slice(-6).toUpperCase()}</h1>
    <p>${statusMessage}</p>
    ${trackingHtml}
    <br />
    <p>Best regards,</p>
    <p><strong>Udaya Cycles Team</strong></p>
  </div>
  `;
};

export const getContactFormEmail = (name: string, email: string, phone: string, message: string) => `
<div style="font-family: Arial, sans-serif; p-4 text-[#282827]">
  <h2>New Contact Form Submission</h2>
  <p><strong>Name:</strong> ${name}</p>
  <p><strong>Email:</strong> ${email}</p>
  <p><strong>Phone:</strong> ${phone || "N/A"}</p>
  <hr />
  <p><strong>Message:</strong></p>
  <p style="white-space: pre-wrap;">${message}</p>
</div>
`;
