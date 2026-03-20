-- ============================================================
-- HealthLuma — Doctor Billing: per-doctor pricing configuration
-- Stored in cents to avoid floating-point issues.
-- ============================================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS consultation_fee_cents integer  NOT NULL DEFAULT 10000
    CHECK (consultation_fee_cents >= 0),
  ADD COLUMN IF NOT EXISTS pro_annual_fee_cents   integer  NOT NULL DEFAULT 15000
    CHECK (pro_annual_fee_cents >= 0),
  ADD COLUMN IF NOT EXISTS pro_discount_pct       smallint NOT NULL DEFAULT 20
    CHECK (pro_discount_pct BETWEEN 0 AND 100);

-- No additional RLS needed — existing "users: own update" policy covers this.
