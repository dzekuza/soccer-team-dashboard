import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixNewPlayerImages() {
  console.log('🔧 Fixing new player images...')

  try {
    // Fix Pijus Srėbalius image URL (remove extra space)
    const { data: pijusData, error: pijusError } = await supabase
      .from('banga_playerss')
      .update({
        image_url: 'https://phvjdfqxzitzohiskwwo.supabase.co/storage/v1/object/public/Teamplayers/Pijus%20Srebalius%201.png'
      })
      .eq('name', 'Pijus Srėbalius')
      .eq('team_key', 'BANGA A')

    if (pijusError) {
      console.error('❌ Error updating Pijus Srėbalius:', pijusError)
    } else {
      console.log('✅ Updated Pijus Srėbalius image URL')
    }

    // Fix Lukas Grinkevičius image URL (remove extra space and newline)
    const { data: lukasData, error: lukasError } = await supabase
      .from('banga_playerss')
      .update({
        image_url: 'https://phvjdfqxzitzohiskwwo.supabase.co/storage/v1/object/public/Teamplayers/Lukas%20Grinkevicius%2012%20vartininkas.png'
      })
      .eq('name', 'Lukas Grinkevičius')
      .eq('team_key', 'BANGA A')

    if (lukasError) {
      console.error('❌ Error updating Lukas Grinkevičius:', lukasError)
    } else {
      console.log('✅ Updated Lukas Grinkevičius image URL')
    }

    // Check for duplicate Lukas Grinkevičius in BANGA B and remove if exists
    const { data: duplicateLukas, error: duplicateError } = await supabase
      .from('banga_playerss')
      .select('*')
      .eq('name', 'Lukas Grinkevičius')
      .eq('team_key', 'BANGA B')

    if (duplicateError) {
      console.error('❌ Error checking for duplicate Lukas:', duplicateError)
    } else if (duplicateLukas && duplicateLukas.length > 0) {
      console.log('⚠️  Found duplicate Lukas Grinkevičius in BANGA B, removing...')
      
      const { error: deleteError } = await supabase
        .from('banga_playerss')
        .delete()
        .eq('name', 'Lukas Grinkevičius')
        .eq('team_key', 'BANGA B')

      if (deleteError) {
        console.error('❌ Error deleting duplicate Lukas:', deleteError)
      } else {
        console.log('✅ Removed duplicate Lukas Grinkevičius from BANGA B')
      }
    }

    // Verify the updates
    console.log('\n🔍 Verifying updates...')
    const { data: updatedPlayers, error: verifyError } = await supabase
      .from('banga_playerss')
      .select('name, image_url, team_key')
      .in('name', ['Pijus Srėbalius', 'Lukas Grinkevičius'])

    if (verifyError) {
      console.error('❌ Error verifying updates:', verifyError)
    } else {
      console.log('📋 Updated players:')
      updatedPlayers?.forEach(player => {
        console.log(`  ${player.name} (${player.team_key}): ${player.image_url}`)
      })
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

fixNewPlayerImages()
