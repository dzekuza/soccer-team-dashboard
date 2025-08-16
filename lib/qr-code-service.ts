import QRCode from "qrcode";
import { createHash } from "crypto";
import type { Ticket, TicketWithDetails } from "./types";

export interface QRCodeData {
  tid: string; // ticketId
  eid: string; // eventId
  et: string; // eventTitle (shortened)
  ed: string; // eventDate
  pn: string; // purchaserName (shortened)
  pe: string; // purchaserEmail (shortened)
  tn: string; // tierName (shortened)
  tp: number; // tierPrice
  ca: string; // createdAt
  sig: string; // signature
}

export interface SubscriptionQRCodeData {
  sid: string; // subscriptionId
  pn: string; // purchaserName (shortened)
  ps: string; // purchaserSurname (shortened)
  pe: string; // purchaserEmail (shortened)
  vf: string; // validFrom
  vt: string; // validTo
  ca: string; // createdAt
  sig: string; // signature
}

export class QRCodeService {
  private static readonly SECRET_KEY = process.env.QR_CODE_SECRET ||
    "default-secret-key-change-in-production";

  /**
   * Generate enhanced QR code data for tickets
   */
  static generateTicketQRData(ticket: TicketWithDetails): QRCodeData {
    const data = {
      tid: ticket.id,
      eid: ticket.eventId,
      et: ticket.event.title.substring(0, 50), // Limit title length
      ed: ticket.event.date,
      pn: ticket.purchaserName.substring(0, 30), // Limit name length
      pe: ticket.purchaserEmail.substring(0, 50), // Limit email length
      tn: ticket.tier.name.substring(0, 20), // Limit tier name length
      tp: ticket.tier.price,
      ca: ticket.createdAt,
    };

    const signature = this.generateSignature(data);

    return {
      ...data,
      sig: signature,
    };
  }

  /**
   * Generate enhanced QR code data for subscriptions
   */
  static generateSubscriptionQRData(subscription: {
    id: string;
    purchaser_name: string;
    purchaser_surname: string;
    purchaser_email: string;
    valid_from: string;
    valid_to: string;
    created_at: string;
  }): SubscriptionQRCodeData {
    const data = {
      sid: subscription.id,
      pn: subscription.purchaser_name.substring(0, 30), // Limit name length
      ps: subscription.purchaser_surname?.substring(0, 30) || "", // Limit surname length
      pe: subscription.purchaser_email.substring(0, 50), // Limit email length
      vf: subscription.valid_from,
      vt: subscription.valid_to,
      ca: subscription.created_at,
    };

    const signature = this.generateSignature(data);

    return {
      ...data,
      sig: signature,
    };
  }

  /**
   * Generate QR code image from data
   */
  static async generateQRCodeImage(
    data: QRCodeData | SubscriptionQRCodeData,
  ): Promise<string> {
    const jsonString = JSON.stringify(data);

    return await QRCode.toDataURL(jsonString, {
      errorCorrectionLevel: "H", // High error correction
      type: "image/png",
      width: 300,
      margin: 2,
      color: {
        dark: "#0A165B", // Main blue color
        light: "#FFFFFF",
      },
    });
  }

  /**
   * Generate signature for data validation
   */
  private static generateSignature(data: any): string {
    const dataString = JSON.stringify(data);
    return createHash("sha256")
      .update(dataString + this.SECRET_KEY)
      .digest("hex")
      .slice(0, 16); // Use first 16 characters for shorter signature
  }

  /**
   * Validate QR code data signature
   */
  static validateSignature(data: any, signature: string): boolean {
    const expectedSignature = this.generateSignature(data);
    return expectedSignature === signature;
  }

  /**
   * Parse QR code data from string
   */
  static parseQRCodeData(
    qrData: string,
  ): QRCodeData | SubscriptionQRCodeData | null {
    try {
      const parsed = JSON.parse(qrData);

      // Validate signature
      const { sig, ...dataWithoutSignature } = parsed;
      if (!this.validateSignature(dataWithoutSignature, sig)) {
        console.error("Invalid QR code signature");
        return null;
      }

      return parsed;
    } catch (error) {
      console.error("Error parsing QR code data:", error);
      return null;
    }
  }

  /**
   * Check if QR code data is for a ticket
   */
  static isTicketQR(
    data: QRCodeData | SubscriptionQRCodeData,
  ): data is QRCodeData {
    return "tid" in data && "eid" in data;
  }

  /**
   * Check if QR code data is for a subscription
   */
  static isSubscriptionQR(
    data: QRCodeData | SubscriptionQRCodeData,
  ): data is SubscriptionQRCodeData {
    return "sid" in data && "vf" in data && "vt" in data;
  }

  /**
   * Generate legacy QR code (just ID) for backward compatibility
   */
  static async generateLegacyQRCode(id: string): Promise<string> {
    return await QRCode.toDataURL(id, {
      errorCorrectionLevel: "H",
      type: "image/png",
      width: 300,
      margin: 2,
      color: {
        dark: "#0A165B",
        light: "#FFFFFF",
      },
    });
  }

  /**
   * Update existing tickets with enhanced QR codes
   */
  static async updateTicketQRCode(ticket: TicketWithDetails): Promise<string> {
    const qrData = this.generateTicketQRData(ticket);
    return await this.generateQRCodeImage(qrData);
  }

  /**
   * Update existing subscription with enhanced QR code
   */
  static async updateSubscriptionQRCode(subscription: {
    id: string;
    purchaser_name: string;
    purchaser_surname: string;
    purchaser_email: string;
    valid_from: string;
    valid_to: string;
    created_at: string;
  }): Promise<string> {
    const qrData = this.generateSubscriptionQRData(subscription);
    return await this.generateQRCodeImage(qrData);
  }
}
