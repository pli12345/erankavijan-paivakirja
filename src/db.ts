import { openDatabaseSync } from "expo-sqlite";

const db = openDatabaseSync("hunter_diary.db");

export type DiaryEntry = {
  id: number;
  date: string;
  location: string | null;
  notes: string | null;
  created_at: string;
};

export function initDb() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS diary_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      location TEXT,
      notes TEXT,
      created_at TEXT NOT NULL
    );
  `);
  console.log("DB initialized");
}

export function listEntries(): DiaryEntry[] {
  return db.getAllSync<DiaryEntry>(
    `SELECT * FROM diary_entries ORDER BY date DESC, id DESC;`
  );
}

export function addEntry(entry: { date: string; location?: string; notes?: string }) {
  db.runSync(
    `INSERT INTO diary_entries (date, location, notes, created_at) VALUES (?, ?, ?, ?)`,
    [entry.date, entry.location ?? null, entry.notes ?? null, new Date().toISOString()]
  );
}
