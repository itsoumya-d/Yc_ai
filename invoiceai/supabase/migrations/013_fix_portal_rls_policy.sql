-- Fix: The "Portal access via token" policy was overly permissive.
-- It allowed ANY user to read ANY invoice where portal_token IS NOT NULL.
-- This fix requires the caller to know the specific portal_token value.

-- Drop the insecure policy
DROP POLICY IF EXISTS "Portal access via token" ON invoices;

-- Create a secure RPC function that validates the token
CREATE OR REPLACE FUNCTION get_invoice_by_portal_token(token TEXT)
RETURNS SETOF invoices
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT * FROM invoices WHERE portal_token = token;
$$;

-- Grant anonymous users permission to call this function
GRANT EXECUTE ON FUNCTION get_invoice_by_portal_token(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_invoice_by_portal_token(TEXT) TO authenticated;
