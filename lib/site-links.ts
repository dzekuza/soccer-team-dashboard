/**
 * Pages that live on the club's main website (WordPress), not in this app.
 * Keep every link to it here so a domain change is a one-line edit.
 */
export const CLUB_SITE_URL = "https://www.fkbanga.lt"

export const CLUB_SITE_LINKS = {
  club: `${CLUB_SITE_URL}/klubas`,
  academy: `${CLUB_SITE_URL}/pamaina`,
  contacts: `${CLUB_SITE_URL}/kontaktai`,
} as const
