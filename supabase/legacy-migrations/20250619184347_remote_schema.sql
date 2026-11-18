

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";





SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."corporations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "owner_id" "uuid"
);


ALTER TABLE "public"."corporations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "date" "date" NOT NULL,
    "time" time without time zone NOT NULL,
    "location" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "team1_id" "uuid",
    "team2_id" "uuid",
    "cover_image_url" "text",
    "corporation_id" "uuid"
);


ALTER TABLE "public"."events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pricing_tiers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "price" numeric(10,2) NOT NULL,
    "max_quantity" integer NOT NULL,
    "sold_quantity" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "corporation_id" "uuid"
);


ALTER TABLE "public"."pricing_tiers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "price" numeric(10,2) NOT NULL,
    "duration_days" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "corporation_id" "uuid"
);


ALTER TABLE "public"."subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."teams" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_name" "text" NOT NULL,
    "logo" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."teams" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tickets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_id" "uuid" NOT NULL,
    "tier_id" "uuid" NOT NULL,
    "purchaser_name" "text" NOT NULL,
    "purchaser_email" "text" NOT NULL,
    "is_validated" boolean DEFAULT false NOT NULL,
    "validated_at" timestamp with time zone,
    "qr_code_url" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "team1_id" "uuid",
    "team2_id" "uuid",
    "pdf_url" "text",
    "corporation_id" "uuid",
    "created_by" "uuid"
);


ALTER TABLE "public"."tickets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_subscriptions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "subscription_id" "uuid" NOT NULL,
    "purchase_date" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone,
    "assigned_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "corporation_id" "uuid"
);


ALTER TABLE "public"."user_subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "name" "text" NOT NULL,
    "surname" "text",
    "phone" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "corporation_id" "uuid",
    "role" character varying(20) DEFAULT 'staff'::character varying,
    CONSTRAINT "users_role_check" CHECK ((("role")::"text" = ANY ((ARRAY['admin'::character varying, 'staff'::character varying])::"text"[])))
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."corporations"
    ADD CONSTRAINT "corporations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pricing_tiers"
    ADD CONSTRAINT "pricing_tiers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tickets"
    ADD CONSTRAINT "tickets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_subscriptions"
    ADD CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "events_team1_id_idx" ON "public"."events" USING "btree" ("team1_id");



CREATE INDEX "idx_events_corporation_id" ON "public"."events" USING "btree" ("corporation_id");



CREATE INDEX "idx_events_corporation_id_new" ON "public"."events" USING "btree" ("corporation_id");



COMMENT ON INDEX "public"."idx_events_corporation_id_new" IS 'Supports queries filtering by corporation_id and foreign key constraint';



CREATE INDEX "idx_events_date_nulls_last" ON "public"."events" USING "btree" ("date");



COMMENT ON INDEX "public"."idx_events_date_nulls_last" IS 'Supports queries filtering by date with NULLS LAST ordering';



CREATE INDEX "idx_events_team1_id_new" ON "public"."events" USING "btree" ("team1_id");



COMMENT ON INDEX "public"."idx_events_team1_id_new" IS 'Supports queries filtering by team1_id and foreign key constraint';



CREATE INDEX "idx_events_team2_id_new" ON "public"."events" USING "btree" ("team2_id");



COMMENT ON INDEX "public"."idx_events_team2_id_new" IS 'Supports queries filtering by team2_id and foreign key constraint';



CREATE INDEX "idx_pricing_tiers_corporation_id_new" ON "public"."pricing_tiers" USING "btree" ("corporation_id");



COMMENT ON INDEX "public"."idx_pricing_tiers_corporation_id_new" IS 'Supports queries filtering by corporation_id and foreign key constraint';



CREATE INDEX "idx_pricing_tiers_event_id" ON "public"."pricing_tiers" USING "btree" ("event_id");



CREATE INDEX "idx_subscriptions_corporation_id_new" ON "public"."subscriptions" USING "btree" ("corporation_id");



COMMENT ON INDEX "public"."idx_subscriptions_corporation_id_new" IS 'Supports queries filtering by corporation_id and foreign key constraint';



CREATE INDEX "idx_tickets_corporation_id_new" ON "public"."tickets" USING "btree" ("corporation_id");



COMMENT ON INDEX "public"."idx_tickets_corporation_id_new" IS 'Supports queries filtering by corporation_id and foreign key constraint';



CREATE INDEX "idx_tickets_created_by" ON "public"."tickets" USING "btree" ("created_by");



CREATE INDEX "idx_tickets_event_id" ON "public"."tickets" USING "btree" ("event_id");



CREATE INDEX "idx_tickets_event_id_new" ON "public"."tickets" USING "btree" ("event_id");



COMMENT ON INDEX "public"."idx_tickets_event_id_new" IS 'Supports queries filtering by event_id and foreign key constraint';



CREATE INDEX "idx_tickets_event_tier_new" ON "public"."tickets" USING "btree" ("event_id", "tier_id");



COMMENT ON INDEX "public"."idx_tickets_event_tier_new" IS 'Composite index for queries filtering by both event_id and tier_id';



CREATE INDEX "idx_tickets_team1_id_new" ON "public"."tickets" USING "btree" ("team1_id");



COMMENT ON INDEX "public"."idx_tickets_team1_id_new" IS 'Supports queries filtering by team1_id and foreign key constraint';



CREATE INDEX "idx_tickets_team2_id_new" ON "public"."tickets" USING "btree" ("team2_id");



COMMENT ON INDEX "public"."idx_tickets_team2_id_new" IS 'Supports queries filtering by team2_id and foreign key constraint';



CREATE INDEX "idx_tickets_tier_id_new" ON "public"."tickets" USING "btree" ("tier_id");



COMMENT ON INDEX "public"."idx_tickets_tier_id_new" IS 'Supports queries filtering by tier_id and foreign key constraint';



CREATE INDEX "idx_tickets_validated_nulls_last" ON "public"."tickets" USING "btree" ("is_validated");



COMMENT ON INDEX "public"."idx_tickets_validated_nulls_last" IS 'Supports queries filtering by is_validated with NULLS LAST ordering';



CREATE INDEX "idx_user_subscriptions_composite_new" ON "public"."user_subscriptions" USING "btree" ("user_id", "subscription_id", "corporation_id");



COMMENT ON INDEX "public"."idx_user_subscriptions_composite_new" IS 'Composite index for queries filtering by user_id, subscription_id, and corporation_id';



CREATE INDEX "idx_user_subscriptions_corporation_id_new" ON "public"."user_subscriptions" USING "btree" ("corporation_id");



COMMENT ON INDEX "public"."idx_user_subscriptions_corporation_id_new" IS 'Supports queries filtering by corporation_id and foreign key constraint';



CREATE INDEX "idx_user_subscriptions_subscription_id_new" ON "public"."user_subscriptions" USING "btree" ("subscription_id");



COMMENT ON INDEX "public"."idx_user_subscriptions_subscription_id_new" IS 'Supports queries filtering by subscription_id and foreign key constraint';



CREATE INDEX "idx_user_subscriptions_user_id_new" ON "public"."user_subscriptions" USING "btree" ("user_id");



COMMENT ON INDEX "public"."idx_user_subscriptions_user_id_new" IS 'Supports queries filtering by user_id and foreign key constraint';



CREATE INDEX "idx_users_corporation_id" ON "public"."users" USING "btree" ("corporation_id");



CREATE INDEX "idx_users_role" ON "public"."users" USING "btree" ("role");



CREATE INDEX "idx_users_role_corporation_new" ON "public"."users" USING "btree" ("role", "corporation_id");



COMMENT ON INDEX "public"."idx_users_role_corporation_new" IS 'Supports role-based queries within corporations';



ALTER TABLE ONLY "public"."corporations"
    ADD CONSTRAINT "corporations_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_corporation_id_fkey" FOREIGN KEY ("corporation_id") REFERENCES "public"."corporations"("id");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_team1_id_fkey" FOREIGN KEY ("team1_id") REFERENCES "public"."teams"("id");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_team2_id_fkey" FOREIGN KEY ("team2_id") REFERENCES "public"."teams"("id");



ALTER TABLE ONLY "public"."user_subscriptions"
    ADD CONSTRAINT "fk_subscription" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_subscriptions"
    ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pricing_tiers"
    ADD CONSTRAINT "pricing_tiers_corporation_id_fkey" FOREIGN KEY ("corporation_id") REFERENCES "public"."corporations"("id");



ALTER TABLE ONLY "public"."pricing_tiers"
    ADD CONSTRAINT "pricing_tiers_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_corporation_id_fkey" FOREIGN KEY ("corporation_id") REFERENCES "public"."corporations"("id");



ALTER TABLE ONLY "public"."tickets"
    ADD CONSTRAINT "tickets_corporation_id_fkey" FOREIGN KEY ("corporation_id") REFERENCES "public"."corporations"("id");



ALTER TABLE ONLY "public"."tickets"
    ADD CONSTRAINT "tickets_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."tickets"
    ADD CONSTRAINT "tickets_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tickets"
    ADD CONSTRAINT "tickets_team1_id_fkey" FOREIGN KEY ("team1_id") REFERENCES "public"."teams"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."tickets"
    ADD CONSTRAINT "tickets_team2_id_fkey" FOREIGN KEY ("team2_id") REFERENCES "public"."teams"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."tickets"
    ADD CONSTRAINT "tickets_tier_id_fkey" FOREIGN KEY ("tier_id") REFERENCES "public"."pricing_tiers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_subscriptions"
    ADD CONSTRAINT "user_subscriptions_corporation_id_fkey" FOREIGN KEY ("corporation_id") REFERENCES "public"."corporations"("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_corporation_id_fkey" FOREIGN KEY ("corporation_id") REFERENCES "public"."corporations"("id");



CREATE POLICY "Insert subscriptions for own corporation" ON "public"."subscriptions" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."corporation_id" = "subscriptions"."corporation_id")))));



CREATE POLICY "Insert subscriptions in corp" ON "public"."subscriptions" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."corporation_id" = "subscriptions"."corporation_id")))));



CREATE POLICY "Insert user_subscriptions for self" ON "public"."user_subscriptions" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Select own user_subscriptions" ON "public"."user_subscriptions" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Select subscriptions for my corporation" ON "public"."subscriptions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."corporation_id" = "subscriptions"."corporation_id")))));



CREATE POLICY "Select subscriptions in corp" ON "public"."subscriptions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."corporation_id" = "subscriptions"."corporation_id")))));



CREATE POLICY "Unified select" ON "public"."teams" FOR SELECT USING (true);



CREATE POLICY "Update subscriptions in corp" ON "public"."subscriptions" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."corporation_id" = "subscriptions"."corporation_id"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."corporation_id" = "subscriptions"."corporation_id")))));



CREATE POLICY "Users can see self" ON "public"."users" FOR SELECT USING (("id" = "auth"."uid"()));



ALTER TABLE "public"."corporations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "corporations_insert_policy" ON "public"."corporations" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



CREATE POLICY "corporations_modify_policy" ON "public"."corporations" USING ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND (("u"."role")::"text" = 'admin'::"text") AND ("u"."corporation_id" = "corporations"."id"))))) WITH CHECK (("id" = ( SELECT "users"."corporation_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



CREATE POLICY "corporations_select_policy" ON "public"."corporations" FOR SELECT USING (("id" = ( SELECT "users"."corporation_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



ALTER TABLE "public"."events" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "events_select_policy" ON "public"."events" FOR SELECT USING (true);



CREATE POLICY "events_write_policy" ON "public"."events" USING ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND (("u"."role")::"text" = 'admin'::"text") AND ("u"."corporation_id" = "events"."corporation_id"))))) WITH CHECK (("corporation_id" = ( SELECT "users"."corporation_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



ALTER TABLE "public"."pricing_tiers" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "pricing_tiers_select_policy" ON "public"."pricing_tiers" FOR SELECT USING (true);



CREATE POLICY "pricing_tiers_write_policy" ON "public"."pricing_tiers" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."users" "u"
     JOIN "public"."events" "e" ON (("e"."id" = "pricing_tiers"."event_id")))
  WHERE (("u"."id" = "auth"."uid"()) AND (("u"."role")::"text" = 'admin'::"text") AND ("e"."corporation_id" = "u"."corporation_id"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."events" "e"
  WHERE (("e"."id" = "pricing_tiers"."event_id") AND ("e"."corporation_id" = ( SELECT "users"."corporation_id"
           FROM "public"."users"
          WHERE ("users"."id" = "auth"."uid"())))))));



ALTER TABLE "public"."subscriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."teams" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tickets" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "tickets_insert_policy" ON "public"."tickets" FOR INSERT WITH CHECK ((("auth"."role"() = 'authenticated'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE ("u"."id" = "auth"."uid"())))));



CREATE POLICY "tickets_select_policy" ON "public"."tickets" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND (("u"."corporation_id" = ( SELECT "e"."corporation_id"
           FROM "public"."events" "e"
          WHERE ("e"."id" = "tickets"."event_id"))) OR ("u"."id" = "tickets"."created_by"))))));



CREATE POLICY "tickets_write_policy" ON "public"."tickets" USING ((EXISTS ( SELECT 1
   FROM ("public"."users" "u"
     JOIN "public"."events" "e" ON (("e"."id" = "tickets"."event_id")))
  WHERE (("u"."id" = "auth"."uid"()) AND (("u"."role")::"text" = 'admin'::"text") AND ("u"."corporation_id" = "e"."corporation_id"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."events" "e"
  WHERE (("e"."id" = "tickets"."event_id") AND ("e"."corporation_id" = ( SELECT "users"."corporation_id"
           FROM "public"."users"
          WHERE ("users"."id" = "auth"."uid"())))))));



ALTER TABLE "public"."user_subscriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users_insert_policy" ON "public"."users" FOR INSERT WITH CHECK (("auth"."role"() = ANY (ARRAY['authenticated'::"text", 'service_role'::"text"])));



CREATE POLICY "users_select_policy" ON "public"."users" FOR SELECT USING ((("id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND (("u"."role")::"text" = 'admin'::"text") AND ("u"."corporation_id" = "users"."corporation_id"))))));



CREATE POLICY "users_update_policy" ON "public"."users" FOR UPDATE USING ((("id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND (("u"."role")::"text" = 'admin'::"text") AND ("u"."corporation_id" = "users"."corporation_id")))))) WITH CHECK (("corporation_id" = ( SELECT "u"."corporation_id"
   FROM "public"."users" "u"
  WHERE ("u"."id" = "auth"."uid"()))));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";








































































































































































GRANT ALL ON TABLE "public"."corporations" TO "anon";
GRANT ALL ON TABLE "public"."corporations" TO "authenticated";
GRANT ALL ON TABLE "public"."corporations" TO "service_role";



GRANT ALL ON TABLE "public"."events" TO "anon";
GRANT ALL ON TABLE "public"."events" TO "authenticated";
GRANT ALL ON TABLE "public"."events" TO "service_role";



GRANT ALL ON TABLE "public"."pricing_tiers" TO "anon";
GRANT ALL ON TABLE "public"."pricing_tiers" TO "authenticated";
GRANT ALL ON TABLE "public"."pricing_tiers" TO "service_role";



GRANT ALL ON TABLE "public"."subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."teams" TO "anon";
GRANT ALL ON TABLE "public"."teams" TO "authenticated";
GRANT ALL ON TABLE "public"."teams" TO "service_role";



GRANT ALL ON TABLE "public"."tickets" TO "anon";
GRANT ALL ON TABLE "public"."tickets" TO "authenticated";
GRANT ALL ON TABLE "public"."tickets" TO "service_role";



GRANT ALL ON TABLE "public"."user_subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."user_subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."user_subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
