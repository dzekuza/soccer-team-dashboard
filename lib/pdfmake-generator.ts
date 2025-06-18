import QRCode from 'qrcode'
import type { TicketWithDetails, Team } from './types'

export async function generateTicketPDFMake(
  ticket: TicketWithDetails,
  team1?: Team,
  team2?: Team
): Promise<Blob> {
  // Dynamically import pdfMake and fonts in the browser
  const pdfMake = (await import('pdfmake/build/pdfmake')) as any;
  const pdfFonts = (await import('pdfmake/build/vfs_fonts')) as any;
  pdfMake.vfs = pdfFonts.pdfMake.vfs;

  // Generate QR code as data URL
  const qrCodeDataUrl = await QRCode.toDataURL(ticket.qr_code_url, { width: 180, margin: 1 });

  // Compose PDFMake document definition
  const docDefinition = {
    content: [
      { text: 'Bilietas', style: 'header' },
      { text: `Renginys: ${ticket.event?.title || ''}` },
      { text: `Pirkėjas: ${ticket.purchaser_name}` },
      { text: `El. paštas: ${ticket.purchaser_email}` },
      { text: `Data: ${ticket.event?.date || ''}` },
      { text: `Laikas: ${ticket.event?.time || ''}` },
      { text: `Tipas: ${ticket.tier?.name || ''}` },
      { text: `Kaina: ${ticket.tier ? ticket.tier.price + ' €' : ''}` },
      { text: ' ' },
      {
        columns: [
          team1?.logo ? { image: team1.logo, width: 60 } : {},
          { text: 'vs', alignment: 'center', width: 40 },
          team2?.logo ? { image: team2.logo, width: 60 } : {},
        ],
        columnGap: 10,
      },
      { text: ' ' },
      { image: qrCodeDataUrl, width: 120, alignment: 'center' },
      { text: ticket.qr_code_url, fontSize: 8, alignment: 'center', margin: [0, 8, 0, 0] },
    ],
    styles: {
      header: { fontSize: 22, bold: true, margin: [0, 0, 0, 10] },
    },
    defaultStyle: {
      font: 'Roboto',
    },
  };

  return new Promise((resolve, reject) => {
    pdfMake.createPdf(docDefinition).getBlob((blob: Blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to generate PDF'));
    });
  });
} 