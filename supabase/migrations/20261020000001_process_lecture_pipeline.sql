-- ====================================================================
-- SUPABASE MIGRATION: Lecture Pod AI Processing Pipeline Schema
-- Migration: 20261020000001_process_lecture_pipeline.sql
-- ====================================================================

-- 1. Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create or Update Lectures Table
CREATE TABLE IF NOT EXISTS public.lectures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Classroom Lecture',
  audio_url TEXT,
  transcript JSONB,
  structured_notes TEXT,
  flashcards JSONB,
  quiz JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure all requested columns exist if table was previously created
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='lectures' AND column_name='device_id') THEN
    ALTER TABLE public.lectures ADD COLUMN device_id TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='lectures' AND column_name='transcript') THEN
    ALTER TABLE public.lectures ADD COLUMN transcript JSONB;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='lectures' AND column_name='structured_notes') THEN
    ALTER TABLE public.lectures ADD COLUMN structured_notes TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='lectures' AND column_name='flashcards') THEN
    ALTER TABLE public.lectures ADD COLUMN flashcards JSONB;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='lectures' AND column_name='quiz') THEN
    ALTER TABLE public.lectures ADD COLUMN quiz JSONB;
  END IF;
END $$;

-- 3. Create Study Materials Table
CREATE TABLE IF NOT EXISTS public.study_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lecture_id UUID REFERENCES public.lectures(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  structured_notes TEXT,
  key_formulas JSONB,
  flashcards JSONB,
  quiz JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create Indexes for High Performance
CREATE INDEX IF NOT EXISTS idx_lectures_user_id ON public.lectures(user_id);
CREATE INDEX IF NOT EXISTS idx_lectures_device_id ON public.lectures(device_id);
CREATE INDEX IF NOT EXISTS idx_lectures_created_at ON public.lectures(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_materials_lecture_id ON public.study_materials(lecture_id);
CREATE INDEX IF NOT EXISTS idx_study_materials_user_id ON public.study_materials(user_id);

-- 5. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_lectures_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_lectures_updated_at ON public.lectures;
CREATE TRIGGER trigger_lectures_updated_at
BEFORE UPDATE ON public.lectures
FOR EACH ROW
EXECUTE FUNCTION update_lectures_updated_at_column();

-- 6. Setup Supabase Storage Bucket for Lecture Audios
INSERT INTO storage.buckets (id, name, public)
VALUES ('lecture-audios', 'lecture-audios', true)
ON CONFLICT (id) DO NOTHING;

-- 7. Enable Row Level Security (RLS)
ALTER TABLE public.lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;

-- Allow edge devices and API service role to insert lectures
DROP POLICY IF EXISTS "Allow edge device and service processing inserts" ON public.lectures;
CREATE POLICY "Allow edge device and service processing inserts"
ON public.lectures
FOR ALL
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow study materials insert and update" ON public.study_materials;
CREATE POLICY "Allow study materials insert and update"
ON public.study_materials
FOR ALL
USING (true)
WITH CHECK (true);

-- Allow students to view only their own lectures
DROP POLICY IF EXISTS "Students can view their own lectures" ON public.lectures;
CREATE POLICY "Students can view their own lectures"
ON public.lectures
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow students to view their own study materials
DROP POLICY IF EXISTS "Students can view their own study materials" ON public.study_materials;
CREATE POLICY "Students can view their own study materials"
ON public.study_materials
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Storage bucket access policies
CREATE POLICY "Public read access for lecture audios"
ON storage.objects
FOR SELECT
USING (bucket_id = 'lecture-audios');

CREATE POLICY "Authenticated and device upload to lecture-audios"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'lecture-audios');
