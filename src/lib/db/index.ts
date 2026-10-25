import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'lecturepod.db');

// Global singleton for better-sqlite3 in development/production
let dbInstance: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (dbInstance) return dbInstance;

  dbInstance = new Database(dbPath);
  dbInstance.pragma('journal_mode = WAL');
  dbInstance.pragma('foreign_keys = ON');

  initSchema(dbInstance);
  return dbInstance;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      college_school TEXT,
      course_branch TEXT,
      semester_class TEXT,
      preferred_language TEXT DEFAULT 'english',
      study_goals TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS devices (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      name TEXT DEFAULT 'Lecture Pod',
      device_identifier TEXT,
      device_id TEXT,
      pair_code TEXT,
      api_key_hash TEXT,
      status TEXT DEFAULT 'UNPAIRED', -- 'UNPAIRED', 'PAIRED', 'offline', 'online', 'syncing'
      last_heartbeat_at DATETIME,
      last_sync_at DATETIME,
      queued_recordings INTEGER DEFAULT 0,
      upload_progress_pct INTEGER DEFAULT 0,
      ip_address TEXT,
      firmware_version TEXT DEFAULT 'v1.2.0-lp',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS device_pairing_tokens (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS lectures (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      device_id TEXT,
      device_recording_id TEXT,
      title TEXT NOT NULL,
      subject TEXT NOT NULL,
      description TEXT,
      tags TEXT, -- JSON array of tags or comma-separated
      recording_date DATETIME NOT NULL,
      duration_seconds INTEGER DEFAULT 0,
      file_size_bytes INTEGER DEFAULT 0,
      audio_url TEXT,
      audio_file_name TEXT,
      status TEXT DEFAULT 'uploaded', -- saved_on_device, waiting_to_sync, uploading, uploaded, transcribing, generating_study_material, ready, failed
      error_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
      FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE SET NULL,
      UNIQUE(user_id, device_recording_id)
    );

    CREATE TABLE IF NOT EXISTS transcripts (
      id TEXT PRIMARY KEY,
      lecture_id TEXT UNIQUE NOT NULL,
      full_text TEXT NOT NULL,
      language TEXT DEFAULT 'en', -- en, hi, hinglish
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lecture_id) REFERENCES lectures(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS transcript_segments (
      id TEXT PRIMARY KEY,
      transcript_id TEXT NOT NULL,
      start_time REAL NOT NULL,
      end_time REAL NOT NULL,
      speaker TEXT DEFAULT 'Instructor',
      text TEXT NOT NULL,
      FOREIGN KEY (transcript_id) REFERENCES transcripts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS study_materials (
      id TEXT PRIMARY KEY,
      lecture_id TEXT UNIQUE NOT NULL,
      summary TEXT NOT NULL,
      key_concepts TEXT, -- JSON array string
      structured_notes_markdown TEXT NOT NULL,
      definitions TEXT, -- JSON array string of {term, definition}
      important_examples TEXT, -- JSON array string
      formulas_and_facts TEXT, -- JSON array string
      exam_takeaways TEXT, -- JSON array string
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lecture_id) REFERENCES lectures(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS flashcards (
      id TEXT PRIMARY KEY,
      lecture_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      status TEXT DEFAULT 'new', -- new, learning, mastered, difficult
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lecture_id) REFERENCES lectures(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS quizzes (
      id TEXT PRIMARY KEY,
      lecture_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lecture_id) REFERENCES lectures(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS quiz_questions (
      id TEXT PRIMARY KEY,
      quiz_id TEXT NOT NULL,
      question TEXT NOT NULL,
      options TEXT NOT NULL, -- JSON array string of 4 choices
      correct_option_index INTEGER NOT NULL,
      explanation TEXT,
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id TEXT PRIMARY KEY,
      quiz_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      score INTEGER NOT NULL,
      total_questions INTEGER NOT NULL,
      answers_json TEXT,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS study_tasks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      lecture_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      due_date TEXT,
      completed INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
      FOREIGN KEY (lecture_id) REFERENCES lectures(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS processing_jobs (
      id TEXT PRIMARY KEY,
      device_id TEXT,
      lecture_id TEXT,
      job_type TEXT NOT NULL, -- audio_upload, transcription, study_material_generation
      status TEXT DEFAULT 'pending', -- pending, running, completed, failed
      error_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE SET NULL,
      FOREIGN KEY (lecture_id) REFERENCES lectures(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_lectures_user ON lectures(user_id);
    CREATE INDEX IF NOT EXISTS idx_lectures_status ON lectures(status);
    CREATE INDEX IF NOT EXISTS idx_flashcards_user ON flashcards(user_id);
    CREATE INDEX IF NOT EXISTS idx_study_tasks_user ON study_tasks(user_id);
    CREATE INDEX IF NOT EXISTS idx_devices_user ON devices(user_id);
  `);

  // Ensure devices table has device_id and pair_code columns if already created
  try {
    const cols = db.pragma('table_info(devices)') as any[];
    const names = cols.map((c: any) => c.name);
    if (!names.includes('device_id')) {
      db.exec("ALTER TABLE devices ADD COLUMN device_id TEXT");
      db.exec("UPDATE devices SET device_id = device_identifier WHERE device_id IS NULL");
    }
    if (!names.includes('pair_code')) {
      db.exec("ALTER TABLE devices ADD COLUMN pair_code TEXT");
    }
  } catch (e) {}

  // Ensure lectures table has transcript, structured_notes, flashcards, quiz columns
  try {
    const lCols = db.pragma('table_info(lectures)') as any[];
    const lNames = lCols.map((c: any) => c.name);
    if (!lNames.includes('transcript')) {
      db.exec("ALTER TABLE lectures ADD COLUMN transcript TEXT");
    }
    if (!lNames.includes('structured_notes')) {
      db.exec("ALTER TABLE lectures ADD COLUMN structured_notes TEXT");
    }
    if (!lNames.includes('flashcards')) {
      db.exec("ALTER TABLE lectures ADD COLUMN flashcards TEXT");
    }
    if (!lNames.includes('quiz')) {
      db.exec("ALTER TABLE lectures ADD COLUMN quiz TEXT");
    }
  } catch (e) {}
}

export default getDatabase;
