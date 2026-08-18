/*
# Sakinya Motors — sale agreement fields

Adds the fields needed to reproduce the paper "Motor Vehicle Sale Agreement"
exactly: vehicle spec fields, contract/deposit dates, witness details, and a
flexible balance breakdown (the agreement lists a variable number of balance
lines, e.g. "financed by X", "to be paid on [date]", "cheque to be banked on
[date]").

1. Vehicles — add reg_no, chassis_no, engine_no, colour, fuel_type, engine_capacity
2. Loans — add contract_date, deposit_date, witness_name, witness_id_number, witness_phone
3. New table `balance_items` — ordered balance breakdown lines per loan
4. RLS — same anon+authenticated full-CRUD pattern as the rest of the app
*/

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS reg_no text;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS chassis_no text;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS engine_no text;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS colour text;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS fuel_type text;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS engine_capacity text;

ALTER TABLE loans ADD COLUMN IF NOT EXISTS contract_date date DEFAULT now();
ALTER TABLE loans ADD COLUMN IF NOT EXISTS deposit_date date;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS witness_name text;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS witness_id_number text;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS witness_phone text;

CREATE TABLE IF NOT EXISTS balance_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id uuid NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  description text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  due_date date,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE balance_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_balance_items" ON balance_items;
CREATE POLICY "anon_select_balance_items" ON balance_items FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_balance_items" ON balance_items;
CREATE POLICY "anon_insert_balance_items" ON balance_items FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_balance_items" ON balance_items;
CREATE POLICY "anon_update_balance_items" ON balance_items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_balance_items" ON balance_items;
CREATE POLICY "anon_delete_balance_items" ON balance_items FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_balance_items_loan ON balance_items (loan_id);
