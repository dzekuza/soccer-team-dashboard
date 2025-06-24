import { Resend } from "resend";
import { supabaseService } from "./supabase-service";
import { generateTicketPDF, generateSubscriptionPDF } from "./pdf-generator";
import { createClient } from '@supabase/supabase-js';
import type { Ticket, Subscription, Team } from "./types";

const resend = new Resend(process.env.RESEND_API_KEY);
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function sendTicketConfirmation(ticketId: string): Promise<void> {
  try {
    const ticket = await supabaseService.getTicketWithDetails(ticketId);
    if (!ticket || !ticket.purchaserEmail) {
      throw new Error("Ticket not found or is missing an email address.");
    }
    
    const template = await supabaseService.getEmailTemplateByName('ticket_confirmation');
    if (!template) {
      throw new Error("Ticket confirmation email template not found.");
    }

    let team1: Team | null = null;
    let team2: Team | null = null;
    if (ticket.event.team1Id) team1 = await supabaseService.getTeamById(ticket.event.team1Id);
    if (ticket.event.team2Id) team2 = await supabaseService.getTeamById(ticket.event.team2Id);

    const pdfBytes = await generateTicketPDF({ ...ticket, qrCodeUrl: ticket.id }, team1 || undefined, team2 || undefined);
    const fileName = `ticket-${ticket.id}.pdf`;

    const eventDate = new Date(ticket.event.date).toLocaleDateString('lt-LT');

    const emailBody = template.body_html
      .replace(/{{purchaser_name}}/g, ticket.purchaserName)
      .replace(/{{event_title}}/g, ticket.event.title)
      .replace(/{{event_date}}/g, eventDate)
      .replace(/{{event_time}}/g, ticket.event.time)
      .replace(/{{event_location}}/g, ticket.event.location);

    const emailSubject = template.subject.replace(/{{event_title}}/g, ticket.event.title);

    await resend.emails.send({
      from: 'info@teamup.lt',
      to: ticket.purchaserEmail,
      subject: emailSubject,
      html: emailBody,
      attachments: [{ filename: fileName, content: Buffer.from(pdfBytes) }]
    });

  } catch (error) {
    console.error(`Failed to send ticket confirmation for ${ticketId}:`, error);
    // Optionally re-throw or handle as needed
  }
}

async function sendSubscriptionConfirmation(subscriptionId: string): Promise<void> {
  try {
    const subscription = await supabaseService.getSubscriptionById(subscriptionId);

    if (
      !subscription ||
      !subscription.purchaser_email ||
      !subscription.purchaser_name ||
      !subscription.purchaser_surname ||
      !subscription.qr_code_url
    ) {
      throw new Error(
        "Subscription data is incomplete and email cannot be sent."
      );
    }

    const template = await supabaseService.getEmailTemplateByName('subscription_confirmation');
    if (!template) {
        throw new Error("Subscription confirmation email template not found.");
    }

    const pdfPayload = {
      id: subscription.id,
      purchaser_name: subscription.purchaser_name,
      purchaser_surname: subscription.purchaser_surname,
      purchaser_email: subscription.purchaser_email,
      qr_code_url: subscription.id,
      valid_from: subscription.valid_from,
      valid_to: subscription.valid_to,
    };

    const pdfBytes = await generateSubscriptionPDF(pdfPayload);
    const fileName = `subscription-${subscription.id}.pdf`;

    const validFrom = new Date(subscription.valid_from).toLocaleDateString('lt-LT');
    const validTo = new Date(subscription.valid_to).toLocaleDateString('lt-LT');
    const validityPeriod = `${validFrom} - ${validTo}`;

    const emailBody = template.body_html.replace('{{validity_period}}', validityPeriod);

    await resend.emails.send({
      from: 'info@teamup.lt',
      to: subscription.purchaser_email,
      subject: template.subject,
      html: emailBody,
      attachments: [{ filename: fileName, content: Buffer.from(pdfBytes) }]
    });

  } catch (error) {
    console.error(`Failed to send subscription confirmation for ${subscriptionId}:`, error);
  }
}

interface BulkEmailPayload {
  to: string[];
  subject: string;
  htmlBody?: string;
  textBody?: string;
}

async function sendBulkEmail({ to, subject, htmlBody, textBody }: BulkEmailPayload): Promise<void> {
  if (to.length === 0) {
    return;
  }
  
  try {
    const payload: any = {
      from: 'info@teamup.lt',
      to: 'noreply@teamup.lt',
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
  sendBulkEmail,
}; 