-- ============================================================
-- HealthLuma — Add notes column to prescriptions
-- Safe to re-run: uses IF NOT EXISTS guard.
--
-- Context: schema.sql creates the prescriptions table without
-- a `notes` column. Migration 20260307000005 adds it inside a
-- CREATE TABLE IF NOT EXISTS block, which is a no-op when the
-- table already exists. This migration ensures the column is
-- present on all deployments regardless of schema.sql version.
-- ============================================================

ALTER TABLE public.prescriptions
  ADD COLUMN IF NOT EXISTS notes text;
