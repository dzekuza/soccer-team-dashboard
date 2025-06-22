-- Create the email_templates table
CREATE TABLE public.email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    subject TEXT NOT NULL,
    body_html TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS Policies for email_templates
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read templates
CREATE POLICY "Allow authenticated read access"
ON public.email_templates
FOR SELECT
TO authenticated
USING (true);

-- Allow admins to manage templates
CREATE POLICY "Allow admin full access"
ON public.email_templates
FOR ALL
TO service_role
USING (true);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_template_update()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update the timestamp
CREATE TRIGGER on_template_update
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE PROCEDURE public.handle_template_update();

-- Insert the default ticket confirmation template
INSERT INTO public.email_templates (name, subject, body_html)
VALUES (
    'ticket_confirmation',
    'Jūsų bilietas į renginį – FK Banga',
    '<p>Sveiki,</p>
<p>Dėkojame, kad įsigijote bilietą į FK Banga organizuojamą renginį! 🟡🔵</p>
<p>Pridedame Jūsų bilietą PDF formatu šiame laiške (prisegtuke). Rekomenduojame jį atsispausdinti arba turėti telefone atvykus į renginį.</p>
<p><strong>Svarbi informacija:</strong></p>
<ul>
  <li>Įėjimas galimas pateikus šį bilietą.</li>
  <li>Atvykite bent 15 minučių prieš renginio pradžią.</li>
  <li>Bilietas galioja tik vienam asmeniui.</li>
  <li>Daugiau informacijos apie renginį rasite mūsų svetainėje: <a href="https://fk-banga.lt">fk-banga.lt</a></li>
</ul>
<p>Jeigu turite klausimų ar negaunate bilieto, susisiekite su mumis el. paštu info@fk-banga.lt.</p>
<p>Iki pasimatymo stadione!<br>FK Banga komanda ⚽</p>'
);

-- Insert the default subscription confirmation template
INSERT INTO public.email_templates (name, subject, body_html)
VALUES (
    'subscription_confirmation',
    'Jūsų FK Banga renginių prenumerata aktyvuota!',
    '<p>Sveiki,</p>
<p>Dėkojame, kad pasirinkote FK Banga prenumeratą! 🎉</p>
<p>Nuo šiol galėsite lankytis visuose mūsų renginiuose be papildomų bilietų.</p>
<p><strong>Jūsų prenumeratos informacija:</strong></p>
<ul>
    <li><strong>Galiojimas:</strong> {{validity_period}}</li>
    <li><strong>Įėjimas:</strong> Tiesiog parodykite šį el. laišką arba savo prenumeratos ID prie įėjimo.</li>
    <li><strong>Vieta:</strong> Visi oficialūs FK Banga namų mačai ir renginiai.</li>
</ul>
<p><strong>Primename:</strong></p>
<ul>
    <li>Prenumerata yra vardinė ir negali būti perduodama kitam asmeniui.</li>
    <li>Norėdami gauti papildomą informaciją ar iškilus klausimams – susisiekite su mumis: info@fk-banga.lt.</li>
</ul>
<p>Ačiū, kad esate kartu su FK Banga. Jūsų palaikymas mums labai svarbus!</p>
<p>Iki susitikimo stadione! 🟡🔵</p>
<br>
<p>Pagarbiai,<br>FK Banga komanda ⚽</p>'
); 