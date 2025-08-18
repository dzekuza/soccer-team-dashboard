import "dotenv/config";
import { writeFileSync } from "fs";
import {
    generateSubscriptionPDF,
    generateTicketPDF,
} from "@/lib/pdf-generator";
import type { Team, TicketWithDetails } from "@/lib/types";

async function main() {
    const now = new Date();
    const eventDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 7,
    );

    const team1: Team = { id: "team-1", team_name: "FK Banga", logo: "" };
    const team2: Team = { id: "team-2", team_name: "Zalgiris", logo: "" };

    const ticket: TicketWithDetails = {
        id: "preview-ticket-0001",
        eventId: "preview-event-0001",
        tierId: "preview-tier-0001",
        purchaserName: "Tomas Ramanauskas",
        purchaserSurname: "Pavyzdys",
        purchaserEmail: "preview@example.com",
        isValidated: false,
        createdAt: now.toISOString(),
        validatedAt: null,
        qrCodeUrl: "preview-ticket-0001",
        status: "paid",
        eventCoverImageUrl: undefined,
        eventDate: eventDate.toISOString().slice(0, 10),
        eventTitle: "FK Banga vs Zalgiris",
        eventDescription: "Draugiskos rungtynes",
        eventLocation: "Gargzdu stadionas",
        eventTime: "14:00",
        team1Id: "team-1",
        team2Id: "team-2",
        teamId: undefined,
        pdfUrl: undefined,
        event: {
            id: "preview-event-0001",
            title: "FK Banga vs Zalgiris",
            description: "Draugiskos rungtynes",
            date: eventDate.toISOString().slice(0, 10),
            time: "14:00",
            location: "Gargzdu stadionas",
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
            team1Id: "team-1",
            team2Id: "team-2",
            coverImageUrl: undefined,
            team1,
            team2,
            pricingTiers: [],
        },
        tier: {
            id: "preview-tier-0001",
            eventId: "preview-event-0001",
            name: "VIP",
            price: 24,
            quantity: 100,
            soldQuantity: 1,
            description: "VIP zona",
        },
    };

    const subscriptionPayload = {
        id: "preview-subscription-0001",
        purchaser_name: "Tomas Ramanauskas",
        purchaser_surname: "Prenumerata",
        purchaser_email: "preview@example.com",
        qr_code_url: "preview-subscription-0001",
        valid_from: eventDate.toISOString().slice(0, 10),
        valid_to: new Date(
            eventDate.getFullYear(),
            eventDate.getMonth() + 1,
            eventDate.getDate(),
        ).toISOString().slice(0, 10),
    };

    console.log("Generating PDFs...");
    const [ticketBytes, subscriptionBytes] = await Promise.all([
        generateTicketPDF(ticket, team1, team2),
        generateSubscriptionPDF(subscriptionPayload),
    ]);

    writeFileSync("ticket-preview.pdf", Buffer.from(ticketBytes));
    writeFileSync("subscription-preview.pdf", Buffer.from(subscriptionBytes));
    console.log("Wrote files: ticket-preview.pdf, subscription-preview.pdf");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
