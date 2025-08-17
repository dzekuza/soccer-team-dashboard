-- Create product categories table
CREATE TABLE IF NOT EXISTS product_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  image_url text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  CONSTRAINT product_categories_pkey PRIMARY KEY (id)
);

-- Create product attributes table (for things like size, color, etc.)
CREATE TABLE IF NOT EXISTS product_attributes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('text', 'number', 'select', 'boolean')),
  options jsonb, -- For select type, stores array of options
  is_required boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  CONSTRAINT product_attributes_pkey PRIMARY KEY (id)
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  short_description text,
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  compare_price numeric(10,2) CHECK (compare_price >= 0),
  cost_price numeric(10,2) CHECK (cost_price >= 0),
  sku text UNIQUE,
  barcode text,
  category_id uuid REFERENCES product_categories(id),
  image_url text,
  gallery_urls text[],
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  weight_grams integer CHECK (weight_grams >= 0),
  dimensions jsonb, -- {length, width, height}
  stock_quantity integer DEFAULT 0 CHECK (stock_quantity >= 0),
  low_stock_threshold integer DEFAULT 5 CHECK (low_stock_threshold >= 0),
  allow_backorders boolean DEFAULT false,
  max_order_quantity integer CHECK (max_order_quantity > 0),
  min_order_quantity integer DEFAULT 1 CHECK (min_order_quantity >= 1),
  tags text[],
  seo_title text,
  seo_description text,
  seo_keywords text[],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  CONSTRAINT products_pkey PRIMARY KEY (id)
);

-- Create product variants table (for products with multiple options like size/color)
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku text UNIQUE,
  barcode text,
  price numeric(10,2) CHECK (price >= 0),
  compare_price numeric(10,2) CHECK (compare_price >= 0),
  cost_price numeric(10,2) CHECK (cost_price >= 0),
  stock_quantity integer DEFAULT 0 CHECK (stock_quantity >= 0),
  weight_grams integer CHECK (weight_grams >= 0),
  dimensions jsonb,
  image_url text,
  attributes jsonb NOT NULL, -- {size: "L", color: "blue"}
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  CONSTRAINT product_variants_pkey PRIMARY KEY (id)
);

-- Create product attribute values table (for storing attribute values for products)
CREATE TABLE IF NOT EXISTS product_attribute_values (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  attribute_id uuid NOT NULL REFERENCES product_attributes(id) ON DELETE CASCADE,
  value text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT product_attribute_values_pkey PRIMARY KEY (id),
  CONSTRAINT product_attribute_values_unique UNIQUE (product_id, attribute_id, value)
);

-- Create inventory transactions table (for tracking stock changes)
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  variant_id uuid REFERENCES product_variants(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('purchase', 'sale', 'adjustment', 'return', 'damage')),
  quantity integer NOT NULL,
  previous_quantity integer NOT NULL,
  new_quantity integer NOT NULL,
  reference text, -- Order ID, purchase order, etc.
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  CONSTRAINT inventory_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT inventory_transactions_product_or_variant CHECK (
    (product_id IS NOT NULL AND variant_id IS NULL) OR 
    (product_id IS NULL AND variant_id IS NOT NULL)
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_product_attribute_values_product_id ON product_attribute_values(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_product_id ON inventory_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_variant_id ON inventory_transactions(variant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_created_at ON inventory_transactions(created_at);

-- Create function to update product stock when variants are updated
CREATE OR REPLACE FUNCTION update_product_stock_from_variants()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE products 
    SET stock_quantity = (
      SELECT COALESCE(SUM(stock_quantity), 0)
      FROM product_variants 
      WHERE product_id = NEW.product_id AND is_active = true
    )
    WHERE id = NEW.product_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE products 
    SET stock_quantity = (
      SELECT COALESCE(SUM(stock_quantity), 0)
      FROM product_variants 
      WHERE product_id = OLD.product_id AND is_active = true
    )
    WHERE id = OLD.product_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update product stock when variants change
DROP TRIGGER IF EXISTS trigger_update_product_stock ON product_variants;
CREATE TRIGGER trigger_update_product_stock
  AFTER INSERT OR UPDATE OR DELETE ON product_variants
  FOR EACH ROW
  EXECUTE FUNCTION update_product_stock_from_variants();

-- Create function to log inventory transactions
CREATE OR REPLACE FUNCTION log_inventory_transaction()
RETURNS TRIGGER AS $$
DECLARE
  v_previous_quantity integer;
  v_new_quantity integer;
  v_product_id uuid;
  v_variant_id uuid;
BEGIN
  -- Determine if this is a product or variant update
  IF TG_TABLE_NAME = 'products' THEN
    v_product_id := NEW.id;
    v_variant_id := NULL;
    v_previous_quantity := OLD.stock_quantity;
    v_new_quantity := NEW.stock_quantity;
  ELSIF TG_TABLE_NAME = 'product_variants' THEN
    v_product_id := NULL;
    v_variant_id := NEW.id;
    v_previous_quantity := OLD.stock_quantity;
    v_new_quantity := NEW.stock_quantity;
  END IF;

  -- Only log if quantity actually changed
  IF v_previous_quantity != v_new_quantity THEN
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
      'adjustment',
      v_new_quantity - v_previous_quantity,
      v_previous_quantity,
      v_new_quantity,
      'Manual adjustment',
      'Stock updated via admin interface',
      auth.uid()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for inventory logging
DROP TRIGGER IF EXISTS trigger_log_product_inventory ON products;
CREATE TRIGGER trigger_log_product_inventory
  AFTER UPDATE ON products
  FOR EACH ROW
  WHEN (OLD.stock_quantity IS DISTINCT FROM NEW.stock_quantity)
  EXECUTE FUNCTION log_inventory_transaction();

DROP TRIGGER IF EXISTS trigger_log_variant_inventory ON product_variants;
CREATE TRIGGER trigger_log_variant_inventory
  AFTER UPDATE ON product_variants
  FOR EACH ROW
  WHEN (OLD.stock_quantity IS DISTINCT FROM NEW.stock_quantity)
  EXECUTE FUNCTION log_inventory_transaction();
