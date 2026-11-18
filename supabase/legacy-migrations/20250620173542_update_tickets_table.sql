-- Step 1: Drop the RLS policy that depends on user_id.
DROP POLICY IF EXISTS "Authenticated users can view and manage their own tickets" ON public.tickets;

-- Step 2: Remove the foreign key constraint on user_id.
-- The "if exists" check prevents errors if the constraint is already gone.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'tickets_user_id_fkey'
  ) THEN
    ALTER TABLE public.tickets DROP CONSTRAINT tickets_user_id_fkey;
  END IF;
END;
$$;

-- Step 3: Remove the user_id column.
ALTER TABLE public.tickets DROP COLUMN IF EXISTS user_id;

-- Step 4: Add new columns for purchaser details.
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS purchaser_email TEXT;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS purchaser_surname TEXT;
