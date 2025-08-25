# Standings Scraping System

This system automatically scrapes standings data from the Lithuanian Football
Federation (LFF) website for all three Banga teams and stores it in the
database.

## Overview

The system scrapes standings from three leagues:

- **Banga A**: TOPsport A lyga (https://www.lff.lt/lygos/a-lyga/)
- **Banga B**: II lyga A divizionas
  (https://www.lff.lt/lygos/ii-lyga-a-divizionas-2025/)
- **Banga M**: Moterų A lyga (https://www.lff.lt/lygos/2025-m-moter-a-lyga/)

## Components

### 1. Database Schema

The `standings` table stores scraped data:

```sql
CREATE TABLE standings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  league_key TEXT UNIQUE NOT NULL,
  league_name TEXT NOT NULL,
  standings_data JSONB NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. LFF Scraper (`lib/lff-scraper.ts`)

A robust scraper utility that:

- Fetches HTML from LFF websites with retry logic
- Parses standings tables using JSDOM
- Handles different table structures
- Extracts team names, logos, and statistics
- Provides error handling and logging

### 3. API Endpoints

#### POST `/api/standings/scrape`

- Triggers scraping of all leagues
- Stores results in database
- Returns scraped data

#### GET `/api/standings/scrape`

- Retrieves stored standings data
- Optional `league` parameter to filter by specific league

### 4. Update Script (`scripts/update-standings.ts`)

A standalone script for automated updates:

```bash
npm run update:standings
```

## Usage

### Manual Scraping

To manually trigger scraping:

```bash
curl -X POST http://localhost:3000/api/standings/scrape
```

### Automated Updates

Set up a cron job to run daily:

```bash
# Add to crontab (runs daily at 2 AM)
0 2 * * * cd /path/to/project && npm run update:standings
```

### Viewing Data

The standings page (`/lentele`) displays scraped data with:

- Tabs for each team (Banga A, Banga B, Banga M)
- Real-time standings table
- Last updated timestamp
- Banga team highlighting

## Data Structure

Each standing row contains:

```typescript
interface StandingRow {
  position: number;
  team: {
    name: string;
    logo?: string;
  };
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  league: string;
  lastUpdated: string;
}
```

## Error Handling

The system includes:

- Retry logic for failed requests
- Graceful error handling
- Logging of all operations
- Fallback to placeholder data when scraping fails

## Monitoring

Check scraping status by:

1. Viewing the standings page for last updated timestamp
2. Checking server logs for scraping operations
3. Monitoring database for new entries

## Dependencies

Required packages:

- `jsdom`: HTML parsing
- `@types/jsdom`: TypeScript types
- `tsx`: TypeScript execution

## Security

- Uses service role key for database operations
- Implements proper RLS policies
- Validates scraped data before storage
- Rate limiting through retry logic
