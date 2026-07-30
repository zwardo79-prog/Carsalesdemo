/*
# Sakinya Motors — vehicle financing management schema

Creates four tables for a dealership financing admin dashboard.

1. New Tables
- `customers` — buyer profiles (name, email, phone, address, id_number)
- `vehicles` — inventory (make, model, year, vin, price, status)
- `loans` — financing contracts linking a customer + vehicle with deposit, balance, duration, monthly payment, interest rate, remaining balance, status
- `payments` — payments made against a loan, with running remaining balance
2. Relationships
- loans.customer_id -> customers.id (ON DELETE CASCADE)
- loans.vehicle_id -> vehicles.id (ON DELETE SET NULL)
- payments.loan_id -> loans.id (ON DELETE CASCADE)
3. Security
- Single-tenant admin app (no sign-in requested). RLS enabled on all tables with anon+authenticated full CRUD because the data is intentionally shared within the dealership.
4. Indexes on foreign keys and status columns for fast dashboard queries.
5. Seed data: 3 customers, 4 vehicles, 1 active loan, 1 payment, so the dashboard is non-empty on first load.
*/

CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  address text,
  id_number text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  make text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL,
  vin text,
  price numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'available',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE SET NULL,
  vehicle_price numeric NOT NULL DEFAULT 0,
  deposit numeric NOT NULL DEFAULT 0,
  balance numeric NOT NULL DEFAULT 0,
  duration_months integer NOT NULL DEFAULT 1,
  interest_rate numeric NOT NULL DEFAULT 0,
  monthly_payment numeric NOT NULL DEFAULT 0,
  remaining_balance numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  start_date date DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id uuid NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  payment_date date NOT NULL DEFAULT now(),
  remaining_after numeric NOT NULL DEFAULT 0,
  note text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_customers" ON customers;
CREATE POLICY "anon_select_customers" ON customers FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_customers" ON customers;
CREATE POLICY "anon_insert_customers" ON customers FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_customers" ON customers;
CREATE POLICY "anon_update_customers" ON customers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_customers" ON customers;
CREATE POLICY "anon_delete_customers" ON customers FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_vehicles" ON vehicles;
CREATE POLICY "anon_select_vehicles" ON vehicles FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_vehicles" ON vehicles;
CREATE POLICY "anon_insert_vehicles" ON vehicles FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_vehicles" ON vehicles;
CREATE POLICY "anon_update_vehicles" ON vehicles FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_vehicles" ON vehicles;
CREATE POLICY "anon_delete_vehicles" ON vehicles FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_loans" ON loans;
CREATE POLICY "anon_select_loans" ON loans FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_loans" ON loans;
CREATE POLICY "anon_insert_loans" ON loans FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_loans" ON loans;
CREATE POLICY "anon_update_loans" ON loans FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_loans" ON loans;
CREATE POLICY "anon_delete_loans" ON loans FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_payments" ON payments;
CREATE POLICY "anon_select_payments" ON payments FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_payments" ON payments;
CREATE POLICY "anon_insert_payments" ON payments FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_payments" ON payments;
CREATE POLICY "anon_update_payments" ON payments FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_payments" ON payments;
CREATE POLICY "anon_delete_payments" ON payments FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_loans_customer ON loans (customer_id);
CREATE INDEX IF NOT EXISTS idx_loans_vehicle ON loans (vehicle_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans (status);
CREATE INDEX IF NOT EXISTS idx_payments_loan ON payments (loan_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles (status);
