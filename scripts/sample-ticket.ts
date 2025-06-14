import fs from 'fs';
import path from 'path';
import { generateTicketPDF } from '../lib/pdf-generator';
import { supabase } from '../lib/supabase';

async function main() {
  // Fetch two teams from Supabase
  const { data: teams } = await supabase.from('teams').select('*').limit(2);
  const team1 = teams?.[0] || { team_name: 'Team 1', logo: '', id: '1' };
  const team2 = teams?.[1] || { team_name: 'Team 2', logo: '', id: '2' };

  // Mock ticket data
  const ticket = {
    id: 'TICKET12345',
    purchaserName: 'John Doe',
    purchaserEmail: 'john@example.com',
    isValidated: false,
    createdAt: new Date().toISOString(),
    validatedAt: null,
    qrCodeUrl: 'https://example.com/validate/TICKET12345',
    event: {
      id: 'EVT1',
      title: 'Svencele Soccer Cup',
      description: 'Annual soccer event',
      date: '2024-07-15',
      time: '18:00',
      location: 'Svencele Stadium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      team1Id: team1.id,
      team2Id: team2.id,
      coverImageUrl: undefined,
    },
    tier: {
      id: 'TIER1',
      eventId: 'EVT1',
      name: 'VIP',
      price: 49.99,
      maxQuantity: 100,
      soldQuantity: 50,
    },
  };

  const pdfBytes = await generateTicketPDF(ticket as any, team1, team2);
  const outPath = path.join(process.cwd(), 'sample-ticket.pdf');
  fs.writeFileSync(outPath, pdfBytes);
  console.log(`Sample ticket PDF generated at: ${outPath}`);
}

main(); 