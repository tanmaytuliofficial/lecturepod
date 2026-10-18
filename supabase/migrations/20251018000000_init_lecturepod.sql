-- Lecture Pod Supabase PostgreSQL Schema with Row Level Security (RLS)

-- 1. Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  college_school TEXT,
  course_branch TEXT,
  semester_class TEXT,
  preferred_language TEXT DEFAULT 'english' CHECK (preferred_language IN ('english', 'hindi', 'hinglish')),
  study_goals TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Devices (LecturePod Device recording hardware)
CREATE TABLE IF NOT EXISTS public.devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  device_identifier TEXT UNIQUE NOT NULL,
  api_key_hash TEXT,
  status TEXT DEFAULT 'paired' CHECK (status IN ('paired', 'offline', 'online', 'syncing')),
  last_heartbeat_at TIMESTAMPTZ,
  last_sync_at TIMESTAMPTZ,
  queued_recordings INT DEFAULT 0,
  upload_progress_pct INT DEFAULT 0,
  ip_address TEXT,
  firmware_version TEXT DEFAULT 'v1.2.0-lp',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Device Pairing Tokens
CREATE TABLE IF NOT EXISTS public.device_pairing_tokens (
  token TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Lectures
CREATE TABLE IF NOT EXISTS public.lectures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  device_id UUID REFERENCES public.devices(id) ON DELETE SET NULL,
  device_recording_id TEXT,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  recording_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_seconds INT DEFAULT 0,
  file_size_bytes BIGINT DEFAULT 0,
  audio_url TEXT,
  audio_file_name TEXT,
  status TEXT DEFAULT 'uploaded' CHECK (status IN (
    'saved_on_device',
    'waiting_to_sync',
    'uploading',
    'uploaded',
    'transcribing',
    'generating_study_material',
    'ready',
    'failed'
  )),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_device_recording UNIQUE (user_id, device_recording_id)
);

-- 5. Transcripts
CREATE TABLE IF NOT EXISTS public.transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lecture_id UUID UNIQUE NOT NULL REFERENCES public.lectures(id) ON DELETE CASCADE,
  full_text TEXT NOT NULL,
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'hi', 'hinglish')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Transcript Segments
CREATE TABLE IF NOT EXISTS public.transcript_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transcript_id UUID NOT NULL REFERENCES public.transcripts(id) ON DELETE CASCADE,
  start_time NUMERIC(8, 2) NOT NULL,
  end_time NUMERIC(8, 2) NOT NULL,
  speaker TEXT DEFAULT 'Instructor',
  text TEXT NOT NULL
);

-- 7. Study Materials
CREATE TABLE IF NOT EXISTS public.study_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lecture_id UUID UNIQUE NOT NULL REFERENCES public.lectures(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  key_concepts JSONB DEFAULT '[]'::jsonb,
  structured_notes_markdown TEXT NOT NULL,
  definitions JSONB DEFAULT '[]'::jsonb,
  important_examples JSONB DEFAULT '[]'::jsonb,
  formulas_and_facts JSONB DEFAULT '[]'::jsonb,
  exam_takeaways JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Flashcards
CREATE TABLE IF NOT EXISTS public.flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lecture_id UUID NOT NULL REFERENCES public.lectures(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'learning', 'mastered', 'difficult')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Quizzes
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lecture_id UUID NOT NULL REFERENCES public.lectures(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Quiz Questions
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option_index INT NOT NULL,
  explanation TEXT
);

-- 11. Quiz Attempts
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score INT NOT NULL,
  total_questions INT NOT NULL,
  answers_json JSONB,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Study Tasks
CREATE TABLE IF NOT EXISTS public.study_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lecture_id UUID REFERENCES public.lectures(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Processing Jobs
CREATE TABLE IF NOT EXISTS public.processing_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES public.devices(id) ON DELETE SET NULL,
  lecture_id UUID REFERENCES public.lectures(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL CHECK (job_type IN ('audio_upload', 'transcription', 'study_material_generation')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_pairing_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcript_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processing_jobs ENABLE ROW LEVEL SECURITY;

-- Profiles: students read and update their own profile
CREATE POLICY "Users can manage own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- Devices: students manage their own devices
CREATE POLICY "Users can manage own devices" ON public.devices
  FOR ALL USING (auth.uid() = user_id);

-- Lectures: students access only their own lectures
CREATE POLICY "Users can manage own lectures" ON public.lectures
  FOR ALL USING (auth.uid() = user_id);

-- Transcripts: students can access transcripts of their lectures
CREATE POLICY "Users access own lecture transcripts" ON public.transcripts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.lectures WHERE id = transcripts.lecture_id AND user_id = auth.uid())
  );

-- Flashcards: students access their own flashcards
CREATE POLICY "Users manage own flashcards" ON public.flashcards
  FOR ALL USING (auth.uid() = user_id);

-- Quizzes: students access their own quizzes
CREATE POLICY "Users manage own quizzes" ON public.quizzes
  FOR ALL USING (auth.uid() = user_id);

-- Study tasks: students manage their own study tasks
CREATE POLICY "Users manage own study tasks" ON public.study_tasks
  FOR ALL USING (auth.uid() = user_id);
