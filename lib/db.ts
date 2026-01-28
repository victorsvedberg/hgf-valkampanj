/**
 * Neon Postgres database connection
 */

import { neon } from "@neondatabase/serverless";

function createSqlClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  return neon(url);
}

// Create client lazily on first use (not at module load time)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _sql: any = null;

export function sql(
  strings: TemplateStringsArray,
  ...values: unknown[]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any[]> {
  if (!_sql) {
    _sql = createSqlClient();
  }
  return _sql(strings, ...values);
}

/**
 * Activity type definition
 */
export interface Activity {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  postnummer: string;
  kommun: string;
  kommun_kod: string;
  lan: string;
  is_online: boolean;
  brevo_list_id: number;
  brevo_folder_id: number | null;
  created_at: string;
}

/**
 * Initialize database tables
 * Run this once to set up the schema
 */
export async function initializeDatabase() {
  // Create petitions table
  await sql`
    CREATE TABLE IF NOT EXISTS petitions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      goal INTEGER NOT NULL DEFAULT 10000,
      brevo_list_id INTEGER NOT NULL,
      count INTEGER NOT NULL DEFAULT 0,
      last_synced_at TIMESTAMPTZ
    )
  `;

  // Create signatures table for recent signers
  await sql`
    CREATE TABLE IF NOT EXISTS signatures (
      id SERIAL PRIMARY KEY,
      petition_id TEXT NOT NULL REFERENCES petitions(id),
      first_name TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // Create index for efficient recent signatures lookup
  await sql`
    CREATE INDEX IF NOT EXISTS idx_signatures_petition_created
    ON signatures(petition_id, created_at DESC)
  `;

  // Create activities table
  await sql`
    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      date DATE NOT NULL,
      time TIME NOT NULL,
      location TEXT,
      postnummer VARCHAR(5),
      kommun TEXT,
      kommun_kod VARCHAR(4),
      lan TEXT,
      is_online BOOLEAN DEFAULT false,
      brevo_list_id INTEGER NOT NULL,
      brevo_folder_id INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Create index for efficient date filtering
  await sql`
    CREATE INDEX IF NOT EXISTS idx_activities_date
    ON activities(date)
  `;

  console.log("Database initialized successfully");
}

/**
 * Seed default petition if it doesn't exist
 */
export async function seedDefaultPetition() {
  const result = await sql`
    INSERT INTO petitions (id, name, goal, brevo_list_id, count)
    VALUES ('stoppa-marknadshyror-2026', 'Stoppa Marknadshyror 2026', 100, 3, 0)
    ON CONFLICT (id) DO NOTHING
    RETURNING id
  `;

  if (result.length > 0) {
    console.log("Default petition created");
  }
}
