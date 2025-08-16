import QRCode from 'qrcode';
import { createHash } from 'crypto';
import type { Ticket, TicketWithDetails } from './types';

export interface QRCodeData {
  ticketId: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  purchaserName: string;
  purchaserEmail: string;
  tierName: string;
  tierPrice: number;
  createdAt: string;
  signature: string; // Hash for validation
}

export interface SubscriptionQRCodeData {
  subscriptionId: string;
  purchaserName: string;
  purchaserSurname: string;
  purchaserEmail: string;
  validFrom: string;
  validTo: string;
  createdAt: string;
  signature: string; // Hash for validation
}

export class QRCodeService {
  private static readonly SECRET_KEY = process.env.QR_CODE_SECRET || 'default-secret-key-change-in-production';
  
  /**
   * Generate enhanced QR code data for tickets
   */
  static generateTicketQRData(ticket: TicketWithDetails): QRCodeData {
    const data: Omit<QRCodeData, 'signature'> = {
      ticketId: ticket.id,
      eventId: ticket.event.id,
      eventTitle: ticket.event.title,
      eventDate: ticket.event.date,
      purchaserName: ticket.purchaserName,
      purchaserEmail: ticket.purchaserEmail,
      tierName: ticket.tier.name,
      tierPrice: ticket.tier.price,
      createdAt: ticket.createdAt,
    };

    const signature = this.generateSignature(data);
    
    return {
      ...data,
      signature,
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
    const data: Omit<SubscriptionQRCodeData, 'signature'> = {
      subscriptionId: subscription.id,
      purchaserName: subscription.purchaser_name,
      purchaserSurname: subscription.purchaser_surname,
      purchaserEmail: subscription.purchaser_email,
      validFrom: subscription.valid_from,
      validTo: subscription.valid_to,
      createdAt: subscription.created_at,
    };

    const signature = this.generateSignature(data);
    
    return {
      ...data,
      signature,
    };
  }

  /**
   * Generate QR code image from data
   */
  static async generateQRCodeImage(data: QRCodeData | SubscriptionQRCodeData): Promise<string> {
    const jsonString = JSON.stringify(data);
    
    return await QRCode.toDataURL(jsonString, {
      errorCorrectionLevel: 'H', // High error correction
      type: 'image/png',
      width: 300,
      margin: 2,
      color: {
        dark: '#0A165B', // Main blue color
        light: '#FFFFFF',
      },
    });
  }

  /**
   * Generate signature for data validation
   */
  private static generateSignature(data: any): string {
    const dataString = JSON.stringify(data);
    return createHash('sha256')
      .update(dataString + this.SECRET_KEY)
      .digest('hex')
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
  static parseQRCodeData(qrData: string): QRCodeData | SubscriptionQRCodeData | null {
    try {
      const parsed = JSON.parse(qrData);
      
      // Validate signature
      const { signature, ...dataWithoutSignature } = parsed;
      if (!this.validateSignature(dataWithoutSignature, signature)) {
        console.error('Invalid QR code signature');
        return null;
      }

      return parsed;
    } catch (error) {
      console.error('Error parsing QR code data:', error);
      return null;
    }
  }

  /**
   * Check if QR code data is for a ticket
   */
  static isTicketQR(data: QRCodeData | SubscriptionQRCodeData): data is QRCodeData {
    return 'ticketId' in data && 'eventId' in data;
  }

  /**
   * Check if QR code data is for a subscription
   */
  static isSubscriptionQR(data: QRCodeData | SubscriptionQRCodeData): data is SubscriptionQRCodeData {
    return 'subscriptionId' in data && 'validFrom' in data && 'validTo' in data;
  }

  /**
   * Generate legacy QR code (just ID) for backward compatibility
   */
  static async generateLegacyQRCode(id: string): Promise<string> {
    return await QRCode.toDataURL(id, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 2,
      color: {
        dark: '#0A165B',
        light: '#FFFFFF',
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
