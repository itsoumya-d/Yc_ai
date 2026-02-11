-- Invoice line items table
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_invoice_items_sort_order ON invoice_items(invoice_id, sort_order);

-- RLS
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Invoice items inherit access from their parent invoice
CREATE POLICY "Users can view items of own invoices" ON invoice_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert items into own invoices" ON invoice_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items of own invoices" ON invoice_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items from own invoices" ON invoice_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid()
    )
  );

-- Portal access for viewing invoice items
CREATE POLICY "Portal can view invoice items" ON invoice_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.portal_token IS NOT NULL
    )
  );
