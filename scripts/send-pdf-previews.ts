import "dotenv/config";
import { Resend } from "resend";
import {
    generateSubscriptionPDF,
    generateTicketPDF,
} from "@/lib/pdf-generator";
import type { TicketWithDetails } from "@/lib/types";

function getArg(name: string, fallback?: string): string | undefined {
    const prefix = `--${name}=`;
    const found = process.argv.find((arg) => arg.startsWith(prefix));
    return found ? found.slice(prefix.length) : fallback;
}

async function main() {
    const to = getArg("to") || "dzekuza@gmail.com";

    if (!process.env.RESEND_API_KEY) {
        console.error(
            "Missing RESEND_API_KEY in environment. Set it and rerun.",
        );
        process.exit(1);
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Build demo ticket payload that matches the current pdf-lib design
    const now = new Date();
    const eventDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 7,
    );

    const ticket: TicketWithDetails = {
        id: "demo-ticket-0001",
        eventId: "demo-event-0001",
        tierId: "demo-tier-0001",
        purchaserName: "Tomas Ramanauskas",
        purchaserSurname: "Pavyzdys",
        purchaserEmail: to,
        isValidated: false,
        createdAt: now.toISOString(),
        validatedAt: null,
        qrCodeUrl: "demo-ticket-0001",
        status: "paid",
        eventCoverImageUrl: undefined,
        eventDate: eventDate.toISOString().slice(0, 10),
        eventTitle: "FK Banga vs Zalgiris",
        eventDescription: "Draugiškos rungtynės",
        eventLocation: "Gargzdu stadionas",
        eventTime: "14:00",
        team1Id: "team-1",
        team2Id: "team-2",
        teamId: undefined,
        pdfUrl: undefined,
        event: {
            id: "demo-event-0001",
            title: "FK Banga vs Zalgiris",
            description: "Draugiškos rungtynes",
            date: eventDate.toISOString().slice(0, 10),
            time: "14:00",
            location: "Gargzdu stadionas",
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
            team1Id: "team-1",
            team2Id: "team-2",
            coverImageUrl: undefined,
            team1: {
                id: "team-1",
                team_name: "FK Banga",
                logo: "https://example.com/banga-logo.png",
                created_at: now.toISOString(),
            },
            team2: {
                id: "team-2",
                team_name: "Zalgiris",
                logo: "https://example.com/zalgiris-logo.png",
                created_at: now.toISOString(),
            },
            pricingTiers: [],
        },
        tier: {
            id: "demo-tier-0001",
            eventId: "demo-event-0001",
            name: "VIP",
            price: 24.0,
            quantity: 100,
            soldQuantity: 1,
            description: "VIP zona",
        },
    };

    const subscriptionPayload = {
        id: "demo-subscription-0001",
        purchaser_name: "Demo Vartotojas",
        purchaser_surname: "Prenumerata",
        purchaser_email: to,
        qr_code_url: "demo-subscription-0001",
        valid_from: eventDate.toISOString().slice(0, 10),
        valid_to: new Date(
            eventDate.getFullYear(),
            eventDate.getMonth() + 1,
            eventDate.getDate(),
        ).toISOString().slice(0, 10),
    };

    console.log("Generating PDFs with current design...");
    const [ticketPdfBytes, subscriptionPdfBytes] = await Promise.all([
        generateTicketPDF(ticket, ticket.event.team1, ticket.event.team2),
        generateSubscriptionPDF(subscriptionPayload),
    ]);

    console.log("Sending email with attachments to", to);
    const result = await resend.emails.send({
        from: "bilietai@noriumuzikos.lt",
        to,
        subject: "PDF previews: Ticket and Subscription (current design)",
        html:
            "<p>Attached are the current ticket and subscription PDF designs generated with pdf-lib.</p>",
        attachments: [
            {
                filename: "ticket-demo.pdf",
                content: Buffer.from(ticketPdfBytes),
            },
            {
                filename: "subscription-demo.pdf",
                content: Buffer.from(subscriptionPdfBytes),
            },
        ],
    });

    if (result.error) {
        console.error("Failed to send email:", result.error);
        process.exit(1);
    }

    console.log("Email sent successfully.");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
