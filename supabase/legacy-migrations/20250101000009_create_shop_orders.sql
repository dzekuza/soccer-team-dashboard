-- Create shop orders table
CREATE TABLE IF NOT EXISTS shop_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  delivery_address jsonb NOT NULL, -- {street, city, postalCode, country}
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  subtotal numeric(10,2) NOT NULL CHECK (subtotal >= 0),
  discount_amount numeric(10,2) DEFAULT 0 CHECK (discount_amount >= 0),
  total_amount numeric(10,2) NOT NULL CHECK (total_amount >= 0),
  currency text DEFAULT 'EUR',
  coupon_code text,
  coupon_discount numeric(10,2) DEFAULT 0,
  shipping_cost numeric(10,2) DEFAULT 0,
  tax_amount numeric(10,2) DEFAULT 0,
  notes text,
  stripe_session_id text,
  stripe_payment_intent_id text,
  tracking_number text,
  shipped_at timestamp with time zone,
  delivered_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  CONSTRAINT shop_orders_pkey PRIMARY KEY (id)
);

-- Create shop order items table
CREATE TABLE IF NOT EXISTS shop_order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES shop_orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  variant_id uuid REFERENCES product_variants(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_sku text,
  variant_attributes jsonb, -- {size: "L", color: "blue"}
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price numeric(10,2) NOT NULL CHECK (total_price >= 0),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT shop_order_items_pkey PRIMARY KEY (id),
  CONSTRAINT shop_order_items_product_or_variant CHECK (
    (product_id IS NOT NULL AND variant_id IS NULL) OR 
    (product_id IS NULL AND variant_id IS NOT NULL)
  )
);

-- Create function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
DECLARE
  order_number text;
  counter integer;
BEGIN
  -- Get the current date in YYYYMMDD format
  order_number := to_char(current_date, 'YYYYMMDD');
  
  -- Get the count of orders for today
  SELECT COALESCE(COUNT(*), 0) + 1
  INTO counter
  FROM shop_orders
  WHERE DATE(created_at) = current_date;
  
  -- Format: YYYYMMDD-XXXX (e.g., 20250101-0001)
  order_number := order_number || '-' || lpad(counter::text, 4, '0');
  
  RETURN order_number;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically generate order number
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_order_number ON shop_orders;
CREATE TRIGGER trigger_set_order_number
  BEFORE INSERT ON shop_orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shop_orders_status ON shop_orders(status);
CREATE INDEX IF NOT EXISTS idx_shop_orders_created_at ON shop_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_shop_orders_customer_email ON shop_orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_shop_orders_order_number ON shop_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_shop_orders_stripe_session_id ON shop_orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_shop_order_items_order_id ON shop_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_shop_order_items_product_id ON shop_order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_shop_order_items_variant_id ON shop_order_items(variant_id);

-- Create function to update order totals
CREATE OR REPLACE FUNCTION update_order_totals()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE shop_orders 
    SET 
      subtotal = (
        SELECT COALESCE(SUM(total_price), 0)
        FROM shop_order_items 
        WHERE order_id = NEW.order_id
      ),
      total_amount = (
        SELECT COALESCE(SUM(total_price), 0)
        FROM shop_order_items 
        WHERE order_id = NEW.order_id
      ) - COALESCE(discount_amount, 0) + COALESCE(shipping_cost, 0) + COALESCE(tax_amount, 0),
      updated_at = now()
    WHERE id = NEW.order_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE shop_orders 
    SET 
      subtotal = (
        SELECT COALESCE(SUM(total_price), 0)
        FROM shop_order_items 
        WHERE order_id = OLD.order_id
      ),
      total_amount = (
        SELECT COALESCE(SUM(total_price), 0)
        FROM shop_order_items 
        WHERE order_id = OLD.order_id
      ) - COALESCE(discount_amount, 0) + COALESCE(shipping_cost, 0) + COALESCE(tax_amount, 0),
      updated_at = now()
    WHERE id = OLD.order_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update order totals when items change
DROP TRIGGER IF EXISTS trigger_update_order_totals ON shop_order_items;
CREATE TRIGGER trigger_update_order_totals
  AFTER INSERT OR UPDATE OR DELETE ON shop_order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_order_totals();

-- Create function to log inventory transactions for orders
CREATE OR REPLACE FUNCTION log_order_inventory_transaction()
RETURNS TRIGGER AS $$
DECLARE
  v_product_id uuid;
  v_variant_id uuid;
  v_quantity integer;
BEGIN
  -- Determine if this is a product or variant
  IF NEW.product_id IS NOT NULL THEN
    v_product_id := NEW.product_id;
    v_variant_id := NULL;
  ELSE
    v_product_id := NULL;
    v_variant_id := NEW.variant_id;
  END IF;
  
  v_quantity := NEW.quantity;
  
  -- Log the inventory transaction
  INSERT INTO inventory_transactions (
    product_id,
    variant_id,
    type,
    quantity,
    previous_quantity,
    new_quantity,
    reference,
    notes,
    created_by
  ) VALUES (
    v_product_id,
    v_variant_id,
    'sale',
    -v_quantity,
    (SELECT stock_quantity FROM products WHERE id = v_product_id),
    (SELECT stock_quantity FROM products WHERE id = v_product_id) - v_quantity,
    NEW.order_id::text,
    'Order item created',
    (SELECT created_by FROM shop_orders WHERE id = NEW.order_id)
  );
  
  -- Update stock quantity
  IF v_product_id IS NOT NULL THEN
    UPDATE products 
    SET stock_quantity = stock_quantity - v_quantity
    WHERE id = v_product_id;
  ELSIF v_variant_id IS NOT NULL THEN
    UPDATE product_variants 
    SET stock_quantity = stock_quantity - v_quantity
    WHERE id = v_variant_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update inventory when order items are created
DROP TRIGGER IF EXISTS trigger_log_order_inventory ON shop_order_items;
CREATE TRIGGER trigger_log_order_inventory
  AFTER INSERT ON shop_order_items
  FOR EACH ROW
  EXECUTE FUNCTION log_order_inventory_transaction();
