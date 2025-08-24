import { Resend } from "resend";
import { supabaseService } from "./supabase-service";
import { generateSubscriptionPDF } from "./pdf-generator";
import { renderTicketHtml } from "./ticket-html";
import { generatePDFFromHTML } from "./pdf-service";
import { createClient } from "@supabase/supabase-js";
import type { Subscription, Team, Ticket } from "./types";
import { getAppUrl } from "./utils";

const resend = new Resend(process.env.RESEND_API_KEY);
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function sendTicketConfirmation(ticketId: string): Promise<void> {
  try {
    const ticket = await supabaseService.getTicketWithDetails(ticketId);
    if (!ticket || !ticket.purchaserEmail) {
      throw new Error("Ticket not found or is missing an email address.");
    }

    const template = await supabaseService.getEmailTemplateByName(
      "ticket_confirmation",
    );
    if (!template) {
      throw new Error("Ticket confirmation email template not found.");
    }

    let team1: Team | null = null;
    let team2: Team | null = null;
    if (ticket.event.team1Id) {
      team1 = await supabaseService.getTeamById(ticket.event.team1Id);
    }
    if (ticket.event.team2Id) {
      team2 = await supabaseService.getTeamById(ticket.event.team2Id);
    }

    // Generate ticket content using the same method as download functionality
    let pdfBytes: Buffer | null = null;
    let fileName: string | null = null;

    try {
      // Use the same HTML generation as the download functionality
      const origin = getAppUrl();
      const html = await renderTicketHtml({
        ticket: { ...ticket, qrCodeUrl: ticket.id } as any,
        origin,
      });

      // Generate PDF using the new PDF service
      pdfBytes = await generatePDFFromHTML({
        html,
        width: "1600px",
        height: "700px",
        printBackground: true,
        preferCSSPageSize: true,
      });

      fileName = `ticket-${ticket.id}.pdf`;
      console.log("Generated PDF ticket successfully using PDF service");
    } catch (pdfError) {
      console.warn("PDF generation failed with PDF service:", pdfError);

      // Fallback: Try using pdf-lib as a last resort
      try {
        console.log("Attempting fallback PDF generation with pdf-lib...");
        const { generateTicketPDF } = await import("./pdf-generator");
        const pdfArray = await generateTicketPDF(
          ticket,
          team1 || undefined,
          team2 || undefined,
        );
        pdfBytes = Buffer.from(pdfArray as any);
        fileName = `ticket-${ticket.id}.pdf`;
        console.log("Generated PDF ticket successfully using fallback method");
      } catch (fallbackError) {
        console.warn("Fallback PDF generation also failed:", fallbackError);
        // Continue without PDF attachment
      }
    }

    const eventDate = new Date(ticket.event.date).toLocaleDateString("lt-LT");

    const emailBody = template.body_html
      .replace(/{{purchaser_name}}/g, ticket.purchaserName)
      .replace(/{{event_title}}/g, ticket.event.title)
      .replace(/{{event_date}}/g, eventDate)
      .replace(/{{event_time}}/g, ticket.event.time)
      .replace(/{{event_location}}/g, ticket.event.location);

    const emailSubject = template.subject.replace(
      /{{event_title}}/g,
      ticket.event.title,
    );

    const emailPayload: any = {
      from: "bilietai@noriumuzikos.lt",
      to: ticket.purchaserEmail,
      subject: emailSubject,
      html: emailBody,
    };

    // Add ticket attachment if available
    if (pdfBytes && fileName) {
      emailPayload.attachments = [{
        filename: fileName,
        content: pdfBytes,
        contentType: "application/pdf",
      }];
      // Update email content to mention PDF ticket
      emailPayload.html = emailPayload.html.replace(
        "Pridedame Jūsų bilietą šiame laiške (prisegtuke).",
        "Pridedame Jūsų bilietą PDF formatu šiame laiške (prisegtuke).",
      );
    } else {
      // Add a note to the email if ticket generation failed
      emailPayload.html +=
        "<p><em>Pastaba: Bilieto PDF negalėjo būti sugeneruotas. Susisiekite su mumis, jei reikia bilieto kopijos.</em></p>";
    }

    await resend.emails.send(emailPayload);
  } catch (error) {
    console.error(`Failed to send ticket confirmation for ${ticketId}:`, error);
    // Re-throw the error so the API can handle it properly
    throw error;
  }
}

async function sendSubscriptionConfirmation(
  subscriptionId: string,
): Promise<void> {
  try {
    const subscription = await supabaseService.getSubscriptionById(
      subscriptionId,
    );

    if (!subscription) {
      throw new Error("Subscription not found.");
    }

    if (!subscription.purchaser_email) {
      throw new Error("Subscription is missing purchaser email address.");
    }

    if (!subscription.purchaser_name) {
      throw new Error("Subscription is missing purchaser name.");
    }

    const template = await supabaseService.getEmailTemplateByName(
      "subscription_confirmation",
    );
    if (!template) {
      throw new Error("Subscription confirmation email template not found.");
    }

    const pdfPayload = {
      id: subscription.id,
      purchaser_name: subscription.purchaser_name,
      purchaser_surname: subscription.purchaser_surname || "",
      purchaser_email: subscription.purchaser_email,
      qr_code_url: subscription.id,
      valid_from: subscription.valid_from,
      valid_to: subscription.valid_to,
    };

    const pdfBytes = await generateSubscriptionPDF(pdfPayload);
    const fileName = `subscription-${subscription.id}.pdf`;

    const validFrom = new Date(subscription.valid_from).toLocaleDateString(
      "lt-LT",
    );
    const validTo = new Date(subscription.valid_to).toLocaleDateString("lt-LT");
    const validityPeriod = `${validFrom} - ${validTo}`;

    const emailBody = template.body_html.replace(
      "{{validity_period}}",
      validityPeriod,
    );

    await resend.emails.send({
      from: "bilietai@noriumuzikos.lt",
      to: subscription.purchaser_email,
      subject: template.subject,
      html: emailBody,
      attachments: [{ filename: fileName, content: Buffer.from(pdfBytes) }],
    });
  } catch (error) {
    console.error(
      `Failed to send subscription confirmation for ${subscriptionId}:`,
      error,
    );
    // Re-throw the error so the API can handle it properly
    throw error;
  }
}

interface BulkEmailPayload {
  to: string[];
  subject: string;
  htmlBody?: string;
  textBody?: string;
}

async function sendShopOrderConfirmation(orderId: string): Promise<void> {
  try {
    const order = await supabaseService.getShopOrderById(orderId);
    if (!order || !order.customer_email) {
      throw new Error("Order not found or is missing customer email address.");
    }

    const template = await supabaseService.getEmailTemplateByName(
      "shop_order_confirmation",
    );
    if (!template) {
      throw new Error("Shop order confirmation email template not found.");
    }

    const orderItems = await supabaseService.getShopOrderItems(orderId);

    // Create order items HTML with improved styling
    const itemsHtml = orderItems.map((item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: left; font-family: 'DM Sans', sans-serif;">
          <div style="font-weight: 600; color: #1f2937;">${item.product_name}</div>
          ${item.product_sku ? `<div style="font-size: 12px; color: #6b7280; margin-top: 2px;">SKU: ${item.product_sku}</div>` : ''}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; font-family: 'DM Sans', sans-serif; color: #374151;">
          ${item.quantity}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-family: 'DM Sans', sans-serif; color: #374151;">
          €${item.unit_price.toFixed(2)}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-family: 'DM Sans', sans-serif; font-weight: 600; color: #1f2937;">
          €${item.total_price.toFixed(2)}
        </td>
      </tr>
    `).join("");

    const emailBody = template.body_html
      .replace(/{{customer_name}}/g, order.customer_name)
      .replace(/{{order_number}}/g, order.order_number)
      .replace(/{{total_amount}}/g, `€${order.total_amount.toFixed(2)}`)
      .replace(/{{order_items}}/g, itemsHtml)
      .replace(
        /{{delivery_address}}/g,
        formatDeliveryAddress(order.delivery_address),
      );

    const emailSubject = template.subject.replace(
      /{{order_number}}/g,
      order.order_number,
    );

    await resend.emails.send({
      from: "bilietai@noriumuzikos.lt",
      to: order.customer_email,
      subject: emailSubject,
      html: emailBody,
    });
  } catch (error) {
    console.error(
      `Failed to send shop order confirmation for ${orderId}:`,
      error,
    );
    throw error;
  }
}

async function sendShopOrderNotificationToAdmin(
  orderId: string,
): Promise<void> {
  try {
    const order = await supabaseService.getShopOrderById(orderId);
    if (!order) {
      throw new Error("Order not found.");
    }

    const template = await supabaseService.getEmailTemplateByName(
      "shop_order_admin_notification",
    );
    if (!template) {
      throw new Error(
        "Shop order admin notification email template not found.",
      );
    }

    const orderItems = await supabaseService.getShopOrderItems(orderId);

    // Create order items HTML with improved styling
    const itemsHtml = orderItems.map((item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: left; font-family: 'DM Sans', sans-serif;">
          <div style="font-weight: 600; color: #1f2937;">${item.product_name}</div>
          ${item.product_sku ? `<div style="font-size: 12px; color: #6b7280; margin-top: 2px;">SKU: ${item.product_sku}</div>` : ''}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; font-family: 'DM Sans', sans-serif; color: #374151;">
          ${item.quantity}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-family: 'DM Sans', sans-serif; color: #374151;">
          €${item.unit_price.toFixed(2)}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-family: 'DM Sans', sans-serif; font-weight: 600; color: #1f2937;">
          €${item.total_price.toFixed(2)}
        </td>
      </tr>
    `).join("");

    const emailBody = template.body_html
      .replace(/{{customer_name}}/g, order.customer_name)
      .replace(/{{customer_email}}/g, order.customer_email)
      .replace(/{{customer_phone}}/g, order.customer_phone || "N/A")
      .replace(/{{order_number}}/g, order.order_number)
      .replace(/{{total_amount}}/g, `€${order.total_amount.toFixed(2)}`)
      .replace(/{{order_items}}/g, itemsHtml)
      .replace(
        /{{delivery_address}}/g,
        formatDeliveryAddress(order.delivery_address),
      );

    const emailSubject = template.subject.replace(
      /{{order_number}}/g,
      order.order_number,
    );

    // Send to admin email (you can configure this in environment variables)
    const adminEmail = process.env.ADMIN_EMAIL || "info@gvozdovic.com";

    await resend.emails.send({
      from: "bilietai@noriumuzikos.lt",
      to: adminEmail,
      subject: emailSubject,
      html: emailBody,
    });
  } catch (error) {
    console.error(
      `Failed to send shop order admin notification for ${orderId}:`,
      error,
    );
    throw error;
  }
}

async function sendShopOrderShippingConfirmation(
  orderId: string,
  trackingNumber: string,
): Promise<void> {
  try {
    const order = await supabaseService.getShopOrderById(orderId);
    if (!order || !order.customer_email) {
      throw new Error("Order not found or is missing customer email address.");
    }

    const template = await supabaseService.getEmailTemplateByName(
      "shop_order_shipping_confirmation",
    );
    if (!template) {
      throw new Error("Shop order shipping confirmation email template not found.");
    }

    const orderItems = await supabaseService.getShopOrderItems(orderId);

    // Create order items HTML with improved styling
    const itemsHtml = orderItems.map((item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: left; font-family: 'DM Sans', sans-serif;">
          <div style="font-weight: 600; color: #1f2937;">${item.product_name}</div>
          ${item.product_sku ? `<div style="font-size: 12px; color: #6b7280; margin-top: 2px;">SKU: ${item.product_sku}</div>` : ''}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; font-family: 'DM Sans', sans-serif; color: #374151;">
          ${item.quantity}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-family: 'DM Sans', sans-serif; font-weight: 600; color: #1f2937;">
          €${item.total_price.toFixed(2)}
        </td>
      </tr>
    `).join("");

    const emailBody = template.body_html
      .replace(/{{customer_name}}/g, order.customer_name)
      .replace(/{{order_number}}/g, order.order_number)
      .replace(/{{tracking_number}}/g, trackingNumber)
      .replace(/{{total_amount}}/g, `€${order.total_amount.toFixed(2)}`)
      .replace(/{{order_items}}/g, itemsHtml)
      .replace(
        /{{delivery_address}}/g,
        formatDeliveryAddress(order.delivery_address),
      );

    const emailSubject = template.subject.replace(
      /{{order_number}}/g,
      order.order_number,
    );

    await resend.emails.send({
      from: "bilietai@noriumuzikos.lt",
      to: order.customer_email,
      subject: emailSubject,
      html: emailBody,
    });
  } catch (error) {
    console.error(
      `Failed to send shop order shipping confirmation for ${orderId}:`,
      error,
    );
    throw error;
  }
}

function formatDeliveryAddress(address: any): string {
  if (!address) return "N/A";

  const parts = [];
  if (address.street) parts.push(address.street);
  if (address.city) parts.push(address.city);
  if (address.postalCode) parts.push(address.postalCode);
  if (address.country) parts.push(address.country);

  return parts.join(", ") || "N/A";
}

async function sendBulkEmail(
  { to, subject, htmlBody, textBody }: BulkEmailPayload,
): Promise<void> {
  if (to.length === 0) {
    return;
  }

  try {
    const payload: any = {
      from: "bilietai@noriumuzikos.lt",
      to: "noreply@resend.dev",
      bcc: to,
      subject: subject,
    };

    if (htmlBody) {
      payload.html = htmlBody;
    } else if (textBody) {
      payload.text = textBody;
    }

    await resend.emails.send(payload);

    console.log(`Bulk email sent successfully to ${to.length} recipients.`);
  } catch (error) {
    console.error("Error sending bulk email:", error);
    throw error;
  }
}

export const notificationService = {
  sendTicketConfirmation,
  sendSubscriptionConfirmation,
  sendShopOrderConfirmation,
  sendShopOrderNotificationToAdmin,
  sendShopOrderShippingConfirmation,
  sendBulkEmail,
};
