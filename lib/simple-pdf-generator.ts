import QRCode from "qrcode";
import type { TicketWithDetails } from "./types";

export async function generateSimpleTicketPDF(
  ticket: TicketWithDetails,
): Promise<Buffer> {
  // Create a professional ticket design matching FK Banga branding
  const qrDataUrl = await QRCode.toDataURL(ticket.id, {
    width: 300,
    margin: 1,
    errorCorrectionLevel: "H",
    color: { dark: "#0A165B", light: "#FFFFFF" },
  });

  const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Bilietas - ${ticket.event?.title || "FK Banga"}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: #FF6B35;
            color: #FFFFFF;
            width: 1600px;
            height: 700px;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .ticket {
            background: #0A165B;
            border-radius: 20px;
            width: 1400px;
            height: 500px;
            display: flex;
            position: relative;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            overflow: hidden;
          }
          
          .ticket::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 6px;
            background: linear-gradient(90deg, #FFD700, #FFA500, #FFD700);
          }
          
          .ticket::after {
            content: '';
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            background-image: 
              radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
            background-size: 50px 50px, 30px 30px;
            pointer-events: none;
          }
          
          .main-section {
            flex: 1;
            padding: 40px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            position: relative;
          }
          
          .stub-section {
            width: 300px;
            padding: 40px 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;
            border-left: 2px dashed rgba(255, 255, 255, 0.3);
          }
          
          .stub-section::before {
            content: '';
            position: absolute;
            left: -10px;
            top: 50%;
            transform: translateY(-50%);
            width: 20px;
            height: 20px;
            background: #FF6B35;
            border-radius: 50%;
          }
          
          .stub-section::after {
            content: '';
            position: absolute;
            right: -10px;
            top: 50%;
            transform: translateY(-50%);
            width: 20px;
            height: 20px;
            background: #FF6B35;
            border-radius: 50%;
          }
          
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          
          .match-label {
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 15px;
            opacity: 0.8;
          }
          
          .match-title {
            font-size: 42px;
            font-weight: 900;
            line-height: 1.1;
            margin-bottom: 30px;
            text-align: center;
          }
          
          .match-logos {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 20px;
            margin-bottom: 30px;
          }
          
          .logo {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #FFD700, #FFA500);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 12px;
            color: #0A165B;
            text-align: center;
            line-height: 1.2;
          }
          
          .details-list {
            display: flex;
            flex-direction: column;
            gap: 20px;
            margin-bottom: 30px;
          }
          
          .detail-row {
            display: flex;
            flex-direction: column;
            gap: 5px;
          }
          
          .detail-label {
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            opacity: 0.7;
          }
          
          .detail-value {
            font-size: 24px;
            font-weight: 700;
            line-height: 1.2;
          }
          
          .purchaser-section {
            margin-top: auto;
          }
          
          .purchaser-label {
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            opacity: 0.7;
            margin-bottom: 8px;
          }
          
          .purchaser-name {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 5px;
          }
          
          .purchaser-email {
            font-size: 16px;
            opacity: 0.8;
          }
          
          .qr-code {
            background: white;
            padding: 20px;
            border-radius: 15px;
            margin-bottom: 20px;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
          }
          
          .qr-code img {
            display: block;
            width: 200px;
            height: 200px;
          }
          
          .qr-label {
            font-size: 14px;
            font-weight: 600;
            text-align: center;
            margin-bottom: 10px;
            opacity: 0.8;
          }
          
          .qr-instruction {
            font-size: 12px;
            text-align: center;
            opacity: 0.7;
          }
          
          .perforation {
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            pointer-events: none;
          }
          
          .perforation::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 20px;
            background-image: 
              radial-gradient(circle at 10px 10px, transparent 3px, #FF6B35 3px, #FF6B35 4px, transparent 4px);
            background-size: 20px 20px;
          }
          
          .perforation::after {
            content: '';
            position: absolute;
            right: 0;
            top: 0;
            bottom: 0;
            width: 20px;
            background-image: 
              radial-gradient(circle at 10px 10px, transparent 3px, #FF6B35 3px, #FF6B35 4px, transparent 4px);
            background-size: 20px 20px;
          }
        </style>
      </head>
      <body>
        <div class="ticket">
          <div class="perforation"></div>
          
          <div class="main-section">
            <div class="header">
              <div class="match-label">Rungtynės</div>
              <div class="match-title">${
    ticket.event?.title || "FK Banga - Zalgiris"
  }</div>
              <div class="match-logos">
                <div class="logo">FK<br>BANGA</div>
                <div class="logo">VS</div>
                <div class="logo">FK<br>BANGA</div>
              </div>
            </div>
            
            <div class="details-list">
              <div class="detail-row">
                <div class="detail-label">Vieta</div>
                <div class="detail-value">${
    ticket.event?.location || "Gargždų stadionas"
  }</div>
              </div>
              
              <div class="detail-row">
                <div class="detail-label">Laikas</div>
                <div class="detail-value">${
    ticket.event?.date
      ? new Date(ticket.event.date).toLocaleDateString("lt-LT", {
        month: "long",
        day: "numeric",
      }) + "d, " + (ticket.event?.time || "14:00")
      : "Sausio 24d, 14:00"
  }</div>
              </div>
              
              <div class="detail-row">
                <div class="detail-label">Bilieto tipas ir kaina</div>
                <div class="detail-value">${ticket.tier?.name || "VIP"} / €${
    ticket.tier?.price?.toFixed(0) || "24"
  }</div>
              </div>
            </div>
            
            <div class="purchaser-section">
              <div class="purchaser-label">Pirkėjas</div>
              <div class="purchaser-name">${
    ticket.purchaserName || "Tomas Ramanauskas"
  }</div>
              <div class="purchaser-email">${
    ticket.purchaserEmail || "info@tomas.lt"
  }</div>
            </div>
          </div>
          
          <div class="stub-section">
            <div class="qr-label">QR kodas</div>
            <div class="qr-code">
              <img src="${qrDataUrl}" alt="QR Code">
            </div>
            <div class="qr-instruction">Skenuokite prie įėjimo</div>
          </div>
        </div>
      </body>
      </html>
    `;

  return Buffer.from(html, "utf-8");
}
