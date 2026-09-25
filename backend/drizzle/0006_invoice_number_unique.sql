DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM invoices
    GROUP BY user_id, invoice_number
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'Cannot add invoice number uniqueness: duplicate invoice numbers exist for a user';
  END IF;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "invoices_user_invoice_number_unique"
  ON "invoices" ("user_id", "invoice_number");
