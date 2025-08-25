#!/usr/bin/env tsx

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { LFFScraper } from '../lib/lff-scraper'

// Load environment variables
config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function updateStandings() {
  try {
    console.log('Starting daily standings update...')
    
    // Scrape all leagues
    const allStandings = await LFFScraper.scrapeAllLeagues()
    
    if (allStandings.length === 0) {
      console.log('No standings data found')
      return
    }
    
    // Store in database
    for (const leagueData of allStandings) {
      const leagueKey = getLeagueKey(leagueData.league)
      
      const { error } = await supabase
        .from('standings')
        .upsert({
          league_key: leagueKey,
          league_name: leagueData.league,
          standings_data: leagueData.standings,
          last_updated: new Date().toISOString()
        }, {
          onConflict: 'league_key'
        })
      
      if (error) {
        console.error(`Error storing ${leagueData.league} standings:`, error)
      } else {
        console.log(`Successfully updated ${leagueData.league} standings`)
      }
    }
    
    console.log('Daily standings update completed successfully')
    
  } catch (error) {
    console.error('Error in daily standings update:', error)
    process.exit(1)
  }
}

function getLeagueKey(leagueName: string): string {
  switch (leagueName) {
    case "Banga A":
      return "a_lyga"
    case "Banga B":
      return "ii_lyga_a"
    case "Banga M":
      return "moteru_a_lyga"
    default:
      return leagueName.toLowerCase().replace(/\s+/g, '_')
  }
}

// Run the update
updateStandings()
