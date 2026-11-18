-- Add improved shop email templates with modern HTML styling

-- Shop Order Confirmation Template (Customer)
INSERT INTO PUBLIC.EMAIL_TEMPLATES (
    NAME,
    SUBJECT,
    BODY_HTML
) VALUES (
    'shop_order_confirmation',
    'Jūsų užsakymas #{{order_number}} patvirtintas – FK Banga',
    '<!DOCTYPE html>
<html lang="lt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Užsakymas patvirtintas</title>
    <style>
        body { font-family: "DM Sans", Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0A165B 0%, #232C62 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: #ffffff; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .logo { width: 80px; height: 80px; margin: 0 auto 20px; display: block; }
        .order-number { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .order-number h2 { margin: 0; color: #0A165B; font-size: 24px; }
        .customer-info { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .items-table th { background: #0A165B; color: white; padding: 12px; text-align: left; }
        .items-table td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
        .total-section { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .total-row { display: flex; justify-content: space-between; margin: 8px 0; }
        .total-final { font-size: 18px; font-weight: bold; color: #0A165B; border-top: 2px solid #0A165B; padding-top: 10px; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; }
        .button { display: inline-block; background: #0A165B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .status-badge { display: inline-block; background: #10b981; color: white; padding: 6px 12px; border-radius: 20px; font-size: 14px; font-weight: 600; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://fk-banga.lt/logo.png" alt="FK Banga" class="logo">
            <h1 style="margin: 0; font-size: 28px;">Ačiū už užsakymą!</h1>
            <p style="margin: 10px 0 0; opacity: 0.9;">Jūsų užsakymas sėkmingai gautas ir apdorojamas</p>
        </div>
        
        <div class="content">
            <p>Sveiki, <strong>{{customer_name}}</strong>!</p>
            
            <p>Dėkojame, kad pasirinkote FK Banga parduotuvę! Jūsų užsakymas buvo sėkmingai gautas ir dabar apdorojamas.</p>
            
            <div class="order-number">
                <h2>Užsakymas #{{order_number}}</h2>
                <span class="status-badge">Patvirtintas</span>
            </div>
            
            <div class="customer-info">
                <h3 style="margin-top: 0; color: #0A165B;">Pristatymo informacija</h3>
                <p style="margin: 5px 0;"><strong>Adresas:</strong> {{delivery_address}}</p>
            </div>
            
            <h3 style="color: #0A165B; margin-top: 30px;">Užsakytos prekės</h3>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Prekė</th>
                        <th style="text-align: center;">Kiekis</th>
                        <th style="text-align: right;">Vieneto kaina</th>
                        <th style="text-align: right;">Suma</th>
                    </tr>
                </thead>
                <tbody>
                    {{order_items}}
                </tbody>
            </table>
            
            <div class="total-section">
                <div class="total-row total-final">
                    <span>Iš viso:</span>
                    <span>{{total_amount}}</span>
                </div>
            </div>
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px; color: #92400e;">Ką toliau?</h4>
                <ul style="margin: 0; padding-left: 20px; color: #92400e;">
                    <li>Jūsų užsakymas bus apdorotas per 1-2 darbo dienas</li>
                    <li>Gavę pranešimą apie išsiuntimą, gausite sekimo numerį</li>
                    <li>Pristatymas trunka 2-5 darbo dienas</li>
                </ul>
            </div>
            
            <p>Jei turite klausimų apie užsakymą, susisiekite su mumis:</p>
            <ul>
                <li><strong>El. paštas:</strong> info@fk-banga.lt</li>
                <li><strong>Telefonas:</strong> +370 XXX XXX XXX</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://fk-banga.lt" class="button">Apsilankykite mūsų svetainėje</a>
            </div>
        </div>
        
        <div class="footer">
            <p>FK Banga | Oficiali komandos parduotuvė</p>
            <p style="font-size: 12px;">Šis el. laiškas buvo išsiųstas automatiškai. Jei turite klausimų, atsakykite į šį laišką.</p>
        </div>
    </div>
</body>
</html>'
);

-- Shop Order Admin Notification Template
INSERT INTO PUBLIC.EMAIL_TEMPLATES (
    NAME,
    SUBJECT,
    BODY_HTML
) VALUES (
    'shop_order_admin_notification',
    'Naujas užsakymas #{{order_number}} – FK Banga Parduotuvė',
    '<!DOCTYPE html>
<html lang="lt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Naujas užsakymas</title>
    <style>
        body { font-family: "DM Sans", Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: #ffffff; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .order-number { background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px solid #dc2626; }
        .order-number h2 { margin: 0; color: #dc2626; font-size: 24px; }
        .customer-info { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .items-table th { background: #dc2626; color: white; padding: 12px; text-align: left; }
        .items-table td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
        .total-section { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .total-row { display: flex; justify-content: space-between; margin: 8px 0; }
        .total-final { font-size: 18px; font-weight: bold; color: #dc2626; border-top: 2px solid #dc2626; padding-top: 10px; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; }
        .status-badge { display: inline-block; background: #dc2626; color: white; padding: 6px 12px; border-radius: 20px; font-size: 14px; font-weight: 600; }
        .urgent { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 28px;">🚨 Naujas užsakymas!</h1>
            <p style="margin: 10px 0 0; opacity: 0.9;">Gautas naujas užsakymas parduotuvėje</p>
        </div>
        
        <div class="content">
            <div class="order-number">
                <h2>Užsakymas #{{order_number}}</h2>
                <span class="status-badge">Laukia apdorojimo</span>
            </div>
            
            <div class="customer-info">
                <h3 style="margin-top: 0; color: #dc2626;">Kliento informacija</h3>
                <p style="margin: 5px 0;"><strong>Vardas:</strong> {{customer_name}}</p>
                <p style="margin: 5px 0;"><strong>El. paštas:</strong> {{customer_email}}</p>
                <p style="margin: 5px 0;"><strong>Telefonas:</strong> {{customer_phone}}</p>
                <p style="margin: 5px 0;"><strong>Pristatymo adresas:</strong> {{delivery_address}}</p>
            </div>
            
            <h3 style="color: #dc2626; margin-top: 30px;">Užsakytos prekės</h3>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Prekė</th>
                        <th style="text-align: center;">Kiekis</th>
                        <th style="text-align: right;">Vieneto kaina</th>
                        <th style="text-align: right;">Suma</th>
                    </tr>
                </thead>
                <tbody>
                    {{order_items}}
                </tbody>
            </table>
            
            <div class="total-section">
                <div class="total-row total-final">
                    <span>Iš viso:</span>
                    <span>{{total_amount}}</span>
                </div>
            </div>
            
            <div class="urgent">
                <h4 style="margin: 0 0 10px; color: #92400e;">Reikalingi veiksmai:</h4>
                <ol style="margin: 0; padding-left: 20px; color: #92400e;">
                    <li>Patikrinkite prekių prieinamumą sandėlyje</li>
                    <li>Paruoškite užsakymą išsiuntimui</li>
                    <li>Atnaujinkite užsakymo statusą sistemoje</li>
                    <li>Išsiųskite klientui pranešimą apie išsiuntimą</li>
                </ol>
            </div>
        </div>
        
        <div class="footer">
            <p>FK Banga | Administravimo sistema</p>
            <p style="font-size: 12px;">Šis el. laiškas buvo išsiųstas automatiškai.</p>
        </div>
    </div>
</body>
</html>'
);

-- Shop Order Shipping Confirmation Template
INSERT INTO PUBLIC.EMAIL_TEMPLATES (
    NAME,
    SUBJECT,
    BODY_HTML
) VALUES (
    'shop_order_shipping_confirmation',
    'Jūsų užsakymas #{{order_number}} išsiųstas – FK Banga',
    '<!DOCTYPE html>
<html lang="lt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Užsakymas išsiųstas</title>
    <style>
        body { font-family: "DM Sans", Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: #ffffff; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .logo { width: 80px; height: 80px; margin: 0 auto 20px; display: block; }
        .order-number { background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px solid #059669; }
        .order-number h2 { margin: 0; color: #059669; font-size: 24px; }
        .tracking-info { background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #059669; }
        .tracking-number { background: #059669; color: white; padding: 10px 15px; border-radius: 6px; font-family: monospace; font-size: 16px; font-weight: bold; display: inline-block; margin: 10px 0; }
        .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .items-table th { background: #059669; color: white; padding: 12px; text-align: left; }
        .items-table td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
        .total-section { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .total-row { display: flex; justify-content: space-between; margin: 8px 0; }
        .total-final { font-size: 18px; font-weight: bold; color: #059669; border-top: 2px solid #059669; padding-top: 10px; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; }
        .status-badge { display: inline-block; background: #059669; color: white; padding: 6px 12px; border-radius: 20px; font-size: 14px; font-weight: 600; }
        .shipping-info { background: #dbeafe; border-left: 4px solid #2563eb; padding: 15px; border-radius: 4px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://fk-banga.lt/logo.png" alt="FK Banga" class="logo">
            <h1 style="margin: 0; font-size: 28px;">🚚 Jūsų užsakymas išsiųstas!</h1>
            <p style="margin: 10px 0 0; opacity: 0.9;">Prekės keliauja į Jūsų adresą</p>
        </div>
        
        <div class="content">
            <p>Sveiki, <strong>{{customer_name}}</strong>!</p>
            
            <p>Puikios naujienos! Jūsų užsakymas buvo sėkmingai išsiųstas ir dabar keliauja į Jūsų adresą.</p>
            
            <div class="order-number">
                <h2>Užsakymas #{{order_number}}</h2>
                <span class="status-badge">Išsiųstas</span>
            </div>
            
            <div class="tracking-info">
                <h3 style="margin-top: 0; color: #059669;">Sekimo informacija</h3>
                <p style="margin: 5px 0;"><strong>Sekimo numeris:</strong></p>
                <div class="tracking-number">{{tracking_number}}</div>
                <p style="margin: 10px 0 0; font-size: 14px; color: #059669;">
                    <strong>Išsiuntimo data:</strong> '
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          || TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI')
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             || '
                </p>
            </div>
            
            <div class="shipping-info">
                <h4 style="margin: 0 0 10px; color: #1e40af;">Pristatymo informacija</h4>
                <ul style="margin: 0; padding-left: 20px; color: #1e40af;">
                    <li>Pristatymas trunka 2-5 darbo dienas</li>
                    <li>Kurjeris susisieks su Jumis prieš pristatymą</li>
                    <li>Pristatymo adresas: {{delivery_address}}</li>
                </ul>
            </div>
            
            <h3 style="color: #059669; margin-top: 30px;">Išsiųstos prekės</h3>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Prekė</th>
                        <th style="text-align: center;">Kiekis</th>
                        <th style="text-align: right;">Suma</th>
                    </tr>
                </thead>
                <tbody>
                    {{order_items}}
                </tbody>
            </table>
            
            <div class="total-section">
                <div class="total-row total-final">
                    <span>Iš viso:</span>
                    <span>{{total_amount}}</span>
                </div>
            </div>
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px; color: #92400e;">Svarbu žinoti:</h4>
                <ul style="margin: 0; padding-left: 20px; color: #92400e;">
                    <li>Išsaugokite sekimo numerį</li>
                    <li>Būkite pasiruošę priimti siuntą</li>
                    <li>Jei turite klausimų, susisiekite su mumis</li>
                </ul>
            </div>
            
            <p>Jei turite klausimų apie pristatymą, susisiekite su mumis:</p>
            <ul>
                <li><strong>El. paštas:</strong> info@fk-banga.lt</li>
                <li><strong>Telefonas:</strong> +370 XXX XXX XXX</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://fk-banga.lt" style="display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Apsilankykite mūsų svetainėje</a>
            </div>
        </div>
        
        <div class="footer">
            <p>FK Banga | Oficiali komandos parduotuvė</p>
            <p style="font-size: 12px;">Šis el. laiškas buvo išsiųstas automatiškai. Jei turite klausimų, atsakykite į šį laišką.</p>
        </div>
    </div>
</body>
</html>'
);

-- Update existing templates if they exist
UPDATE PUBLIC.EMAIL_TEMPLATES
SET
    SUBJECT = 'Jūsų užsakymas #{{order_number}} patvirtintas – FK Banga',
    BODY_HTML = '<!DOCTYPE html>
<html lang="lt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Užsakymas patvirtintas</title>
    <style>
        body { font-family: "DM Sans", Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0A165B 0%, #232C62 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: #ffffff; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .logo { width: 80px; height: 80px; margin: 0 auto 20px; display: block; }
        .order-number { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .order-number h2 { margin: 0; color: #0A165B; font-size: 24px; }
        .customer-info { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .items-table th { background: #0A165B; color: white; padding: 12px; text-align: left; }
        .items-table td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
        .total-section { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .total-row { display: flex; justify-content: space-between; margin: 8px 0; }
        .total-final { font-size: 18px; font-weight: bold; color: #0A165B; border-top: 2px solid #0A165B; padding-top: 10px; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; }
        .button { display: inline-block; background: #0A165B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .status-badge { display: inline-block; background: #10b981; color: white; padding: 6px 12px; border-radius: 20px; font-size: 14px; font-weight: 600; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://fk-banga.lt/logo.png" alt="FK Banga" class="logo">
            <h1 style="margin: 0; font-size: 28px;">Ačiū už užsakymą!</h1>
            <p style="margin: 10px 0 0; opacity: 0.9;">Jūsų užsakymas sėkmingai gautas ir apdorojamas</p>
        </div>
        
        <div class="content">
            <p>Sveiki, <strong>{{customer_name}}</strong>!</p>
            
            <p>Dėkojame, kad pasirinkote FK Banga parduotuvę! Jūsų užsakymas buvo sėkmingai gautas ir dabar apdorojamas.</p>
            
            <div class="order-number">
                <h2>Užsakymas #{{order_number}}</h2>
                <span class="status-badge">Patvirtintas</span>
            </div>
            
            <div class="customer-info">
                <h3 style="margin-top: 0; color: #0A165B;">Pristatymo informacija</h3>
                <p style="margin: 5px 0;"><strong>Adresas:</strong> {{delivery_address}}</p>
            </div>
            
            <h3 style="color: #0A165B; margin-top: 30px;">Užsakytos prekės</h3>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Prekė</th>
                        <th style="text-align: center;">Kiekis</th>
                        <th style="text-align: right;">Vieneto kaina</th>
                        <th style="text-align: right;">Suma</th>
                    </tr>
                </thead>
                <tbody>
                    {{order_items}}
                </tbody>
            </table>
            
            <div class="total-section">
                <div class="total-row total-final">
                    <span>Iš viso:</span>
                    <span>{{total_amount}}</span>
                </div>
            </div>
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px; color: #92400e;">Ką toliau?</h4>
                <ul style="margin: 0; padding-left: 20px; color: #92400e;">
                    <li>Jūsų užsakymas bus apdorotas per 1-2 darbo dienas</li>
                    <li>Gavę pranešimą apie išsiuntimą, gausite sekimo numerį</li>
                    <li>Pristatymas trunka 2-5 darbo dienas</li>
                </ul>
            </div>
            
            <p>Jei turite klausimų apie užsakymą, susisiekite su mumis:</p>
            <ul>
                <li><strong>El. paštas:</strong> info@fk-banga.lt</li>
                <li><strong>Telefonas:</strong> +370 XXX XXX XXX</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://fk-banga.lt" class="button">Apsilankykite mūsų svetainėje</a>
            </div>
        </div>
        
        <div class="footer">
            <p>FK Banga | Oficiali komandos parduotuvė</p>
            <p style="font-size: 12px;">Šis el. laiškas buvo išsiųstas automatiškai. Jei turite klausimų, atsakykite į šį laišką.</p>
        </div>
    </div>
</body>
</html>'
WHERE
    NAME = 'shop_order_confirmation';

UPDATE PUBLIC.EMAIL_TEMPLATES
SET
    SUBJECT = 'Naujas užsakymas #{{order_number}} – FK Banga Parduotuvė',
    BODY_HTML = '<!DOCTYPE html>
<html lang="lt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Naujas užsakymas</title>
    <style>
        body { font-family: "DM Sans", Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: #ffffff; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .order-number { background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px solid #dc2626; }
        .order-number h2 { margin: 0; color: #dc2626; font-size: 24px; }
        .customer-info { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .items-table th { background: #dc2626; color: white; padding: 12px; text-align: left; }
        .items-table td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
        .total-section { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .total-row { display: flex; justify-content: space-between; margin: 8px 0; }
        .total-final { font-size: 18px; font-weight: bold; color: #dc2626; border-top: 2px solid #dc2626; padding-top: 10px; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; }
        .status-badge { display: inline-block; background: #dc2626; color: white; padding: 6px 12px; border-radius: 20px; font-size: 14px; font-weight: 600; }
        .urgent { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 28px;">🚨 Naujas užsakymas!</h1>
            <p style="margin: 10px 0 0; opacity: 0.9;">Gautas naujas užsakymas parduotuvėje</p>
        </div>
        
        <div class="content">
            <div class="order-number">
                <h2>Užsakymas #{{order_number}}</h2>
                <span class="status-badge">Laukia apdorojimo</span>
            </div>
            
            <div class="customer-info">
                <h3 style="margin-top: 0; color: #dc2626;">Kliento informacija</h3>
                <p style="margin: 5px 0;"><strong>Vardas:</strong> {{customer_name}}</p>
                <p style="margin: 5px 0;"><strong>El. paštas:</strong> {{customer_email}}</p>
                <p style="margin: 5px 0;"><strong>Telefonas:</strong> {{customer_phone}}</p>
                <p style="margin: 5px 0;"><strong>Pristatymo adresas:</strong> {{delivery_address}}</p>
            </div>
            
            <h3 style="color: #dc2626; margin-top: 30px;">Užsakytos prekės</h3>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Prekė</th>
                        <th style="text-align: center;">Kiekis</th>
                        <th style="text-align: right;">Vieneto kaina</th>
                        <th style="text-align: right;">Suma</th>
                    </tr>
                </thead>
                <tbody>
                    {{order_items}}
                </tbody>
            </table>
            
            <div class="total-section">
                <div class="total-row total-final">
                    <span>Iš viso:</span>
                    <span>{{total_amount}}</span>
                </div>
            </div>
            
            <div class="urgent">
                <h4 style="margin: 0 0 10px; color: #92400e;">Reikalingi veiksmai:</h4>
                <ol style="margin: 0; padding-left: 20px; color: #92400e;">
                    <li>Patikrinkite prekių prieinamumą sandėlyje</li>
                    <li>Paruoškite užsakymą išsiuntimui</li>
                    <li>Atnaujinkite užsakymo statusą sistemoje</li>
                    <li>Išsiųskite klientui pranešimą apie išsiuntimą</li>
                </ol>
            </div>
        </div>
        
        <div class="footer">
            <p>FK Banga | Administravimo sistema</p>
            <p style="font-size: 12px;">Šis el. laiškas buvo išsiųstas automatiškai.</p>
        </div>
    </div>
</body>
</html>'
WHERE
    NAME = 'shop_order_admin_notification';