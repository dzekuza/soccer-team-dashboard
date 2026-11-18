-- Remove duplicate player records from banga_playerss table
-- This migration will keep only the most recent record for each unique player

-- First, create a temporary table with the records we want to keep
CREATE TEMP TABLE TEMP_UNIQUE_PLAYERS AS
SELECT DISTINCT ON (NAME, TEAM_KEY)
  ID,
  NAME,
  SURNAME,
  NUMBER,
  POSITION,
  MATCHES,
  MINUTES,
  GOALS,
  ASSISTS,
  YELLOW_CARDS,
  RED_CARDS,
  TEAM_KEY,
  PROFILE_URL,
  IMAGE_URL,
  INSERTED_AT,
  FINGERPRINT,
  NAME_FIRST,
  NAME_LAST,
  UPDATED_AT
FROM BANGA_PLAYERSS
WHERE NAME IS NOT NULL
  AND TEAM_KEY IS NOT NULL
ORDER BY NAME, TEAM_KEY, INSERTED_AT DESC;

-- Delete all records from the original table
DELETE FROM BANGA_PLAYERSS;

-- Insert back only the unique records
INSERT INTO BANGA_PLAYERSS (
    ID,
    NAME,
    SURNAME,
    NUMBER,
    POSITION,
    MATCHES,
    MINUTES,
    GOALS,
    ASSISTS,
    YELLOW_CARDS,
    RED_CARDS,
    TEAM_KEY,
    PROFILE_URL,
    IMAGE_URL,
    INSERTED_AT,
    FINGERPRINT,
    NAME_FIRST,
    NAME_LAST,
    UPDATED_AT
)
    SELECT
        ID,
        NAME,
        SURNAME,
        NUMBER,
        POSITION,
        MATCHES,
        MINUTES,
        GOALS,
        ASSISTS,
        YELLOW_CARDS,
        RED_CARDS,
        TEAM_KEY,
        PROFILE_URL,
        IMAGE_URL,
        INSERTED_AT,
        FINGERPRINT,
        NAME_FIRST,
        NAME_LAST,
        UPDATED_AT
    FROM
        TEMP_UNIQUE_PLAYERS;

-- Drop the temporary table
DROP TABLE TEMP_UNIQUE_PLAYERS;

-- Add a unique constraint to prevent future duplicates
ALTER TABLE BANGA_PLAYERSS
    ADD CONSTRAINT UNIQUE_PLAYER_NAME_TEAM UNIQUE (
        NAME,
        TEAM_KEY
    );

-- Create an index for better performance
CREATE INDEX IF NOT EXISTS IDX_BANGA_PLAYERSS_NAME_TEAM_UNIQUE
ON BANGA_PLAYERSS(NAME, TEAM_KEY);