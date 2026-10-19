-- ====================================================================
-- SUPABASE MIGRATION: Lecture Pod Device Pairing & Status Backend Schema
-- Migration: 20261020000000_device_pairing_system.sql
-- ====================================================================

-- Enable pgcrypto / uuid-ossp extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create or replace the devices table strictly meeting the specification
CREATE TABLE IF NOT EXISTS public.devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT UNIQUE NOT NULL,
  pair_code TEXT,
  status TEXT NOT NULL DEFAULT 'UNPAIRED' CHECK (status IN ('UNPAIRED', 'PAIRED')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast querying during pairing and Raspberry Pi heartbeat polling
CREATE INDEX IF NOT EXISTS idx_devices_device_id ON public.devices(device_id);
CREATE INDEX IF NOT EXISTS idx_devices_pair_code ON public.devices(pair_code);
CREATE INDEX IF NOT EXISTS idx_devices_user_id ON public.devices(user_id);
CREATE INDEX IF NOT EXISTS idx_devices_status ON public.devices(status);

-- Automatic updated_at trigger function
CREATE OR REPLACE FUNCTION update_devices_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_devices_updated_at ON public.devices;
CREATE TRIGGER trigger_devices_updated_at
BEFORE UPDATE ON public.devices
FOR EACH ROW
EXECUTE FUNCTION update_devices_updated_at_column();

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

-- 1. Hardware Edge / Raspberry Pi & Service Role: Allow registration and status polling
DROP POLICY IF EXISTS "Allow hardware edge registration and status read" ON public.devices;
CREATE POLICY "Allow hardware edge registration and status read"
ON public.devices
FOR ALL
USING (true)
WITH CHECK (true);

-- 2. Authenticated Students: Can read their own paired devices
DROP POLICY IF EXISTS "Students can view their owned devices" ON public.devices;
CREATE POLICY "Students can view their owned devices"
ON public.devices
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 3. Authenticated Students: Can claim/pair an UNPAIRED device with matching code
DROP POLICY IF EXISTS "Students can pair an unpaired device" ON public.devices;
CREATE POLICY "Students can pair an unpaired device"
ON public.devices
FOR UPDATE
TO authenticated
USING (status = 'UNPAIRED')
WITH CHECK (auth.uid() = user_id AND status = 'PAIRED');
