import QRCode from "qrcode";
import type { TicketWithDetails } from "./types";

function escapeHtml(text: string | undefined) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function monthLt(dateISO: string) {
  const d = new Date(dateISO);
  const months = [
    "Sausio",
    "Vasario",
    "Kovo",
    "Balandžio",
    "Gegužės",
    "Birželio",
    "Liepos",
    "Rugpjūčio",
    "Rugsėjo",
    "Spalio",
    "Lapkričio",
    "Gruodžio",
  ];
  return `${months[d.getMonth()]} ${d.getDate()}d`;
}

export async function renderTicketHtml(options: {
  ticket: TicketWithDetails;
  origin: string;
}): Promise<string> {
  const { ticket, origin } = options;

  const title = ticket.event?.title || "Bilietas";
  const location = ticket.event?.location || "";
  const dateText = `${monthLt(ticket.event.date)}, ${ticket.event.time}`;
  const priceText = ticket.tier
    ? `${ticket.tier.name} / €${ticket.tier.price.toFixed(0)}`
    : "N/A";
  const purchaserName = ticket.purchaserName || "";
  const purchaserEmail = ticket.purchaserEmail || "";

  const qrDataUrl = await QRCode.toDataURL(ticket.id, {
    width: 300,
    margin: 1,
    errorCorrectionLevel: "H",
    color: { dark: "#0A165B", light: "#FFFFFF" },
  });

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="color-scheme" content="light" />
  <style>
    html, body { margin: 0; padding: 0; }
    body {
      width: 1600px; height: 700px;
      background: linear-gradient(135deg, #0A165B 0%, #1a237e 100%);
      font-family: -apple-system, Segoe UI, Roboto, Inter, Arial, sans-serif;
      color: #fff;
    }
    .wrap { position: relative; width: 100%; height: 100%; }
    .left { position: absolute; left: 120px; right: 560px; top: 90px; }
    .label { font-size: 18px; opacity: 0.8; margin-bottom: 8px; }
    .title { font-weight: 800; font-size: 42px; margin: 18px 0 36px; }
    .value-lg { font-weight: 700; font-size: 32px; margin: 0 0 28px; }
    .row { display: flex; gap: 64px; }
    .col { flex: 1; min-width: 280px; }
    .value { font-weight: 700; font-size: 30px; margin: 0; }
    .value-sm { font-size: 16px; margin-top: 8px; }
    .qr { position: absolute; right: 140px; top: 140px; width: 300px; }
    .qr-card { background: #fff; padding: 10px; border-radius: 12px; display: inline-block; }
    .qr img { display: block; width: 300px; height: 300px; }
    .qr .label { color: #fff; opacity: 1; margin: 12px 0 4px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="left">
      <div class="label">Rungtynės</div>
      <div class="title">${escapeHtml(title)}</div>

      <div class="label">Vieta</div>
      <div class="value-lg">${escapeHtml(location)}</div>

      <div class="row">
        <div class="col">
          <div class="label">Laikas</div>
          <div class="value">${escapeHtml(dateText)}</div>
        </div>
        <div class="col">
          <div class="label">Bilieto tipas ir kaina</div>
          <div class="value">${escapeHtml(priceText)}</div>
        </div>
      </div>

      <div style="height: 24px"></div>
      <div class="label">Pirkėjas</div>
      <div class="value" style="font-size: 26px;">${
    escapeHtml(purchaserName)
  }</div>
      <div class="value-sm">${escapeHtml(purchaserEmail)}</div>
    </div>

    <div class="qr">
      <div class="qr-card"><img src="${qrDataUrl}" alt="QR" /></div>
      <div class="label">QR kodas</div>
      <div class="value-sm">Skenuokite prie įėjimo</div>
    </div>
  </div>
</body>
</html>`;
}
