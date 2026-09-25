import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required");

const sql = neon(databaseUrl);
const statements = [
  `CREATE EXTENSION IF NOT EXISTS pgcrypto`,
  `DO $$ BEGIN CREATE TYPE campaign_category AS ENUM ('senior-care', 'food-relief', 'cleanup', 'education', 'health'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE TYPE campaign_status AS ENUM ('active', 'completed', 'cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `CREATE TABLE IF NOT EXISTS users (id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL, name varchar(120) NOT NULL, email varchar(255) NOT NULL UNIQUE, password_hash text, avatar_url text, city varchar(120), bio text, role varchar(20) DEFAULT 'member' NOT NULL, email_verified_at timestamptz, created_at timestamptz DEFAULT now() NOT NULL, updated_at timestamptz DEFAULT now() NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS sessions (id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL, user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, token_hash varchar(64) NOT NULL UNIQUE, user_agent text, ip varchar(64), expires_at timestamptz NOT NULL, created_at timestamptz DEFAULT now() NOT NULL, last_seen_at timestamptz DEFAULT now() NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS oauth_accounts (id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL, user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, provider varchar(30) NOT NULL, provider_account_id varchar(255) NOT NULL, email varchar(255), created_at timestamptz DEFAULT now() NOT NULL, UNIQUE(provider, provider_account_id))`,
  `CREATE TABLE IF NOT EXISTS verification_codes (id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL, email varchar(255) NOT NULL, user_id uuid REFERENCES users(id) ON DELETE CASCADE, code_hash varchar(64) NOT NULL, purpose varchar(30) DEFAULT 'signup' NOT NULL, attempts integer DEFAULT 0 NOT NULL, expires_at timestamptz NOT NULL, last_sent_at timestamptz DEFAULT now() NOT NULL, created_at timestamptz DEFAULT now() NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS volunteer_profiles (id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL, user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE, city varchar(120) NOT NULL, phone varchar(20), interests text[] DEFAULT '{}' NOT NULL, availability varchar(120) NOT NULL, bio text, hours_logged integer DEFAULT 0 NOT NULL, created_at timestamptz DEFAULT now() NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS campaigns (id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL, slug varchar(255) NOT NULL UNIQUE, title varchar(160) NOT NULL, summary varchar(300) NOT NULL, description text NOT NULL, category campaign_category NOT NULL, city varchar(120) NOT NULL, location varchar(255) NOT NULL, image_url text NOT NULL, start_at timestamptz NOT NULL, end_at timestamptz, volunteers_needed integer DEFAULT 20 NOT NULL, status campaign_status DEFAULT 'active' NOT NULL, organizer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, created_at timestamptz DEFAULT now() NOT NULL, updated_at timestamptz DEFAULT now() NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS campaign_signups (id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL, campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE, user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, message text, status varchar(20) DEFAULT 'joined' NOT NULL, created_at timestamptz DEFAULT now() NOT NULL, UNIQUE(campaign_id, user_id))`,
  `CREATE TABLE IF NOT EXISTS contact_messages (id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL, name varchar(120) NOT NULL, email varchar(255) NOT NULL, subject varchar(200) NOT NULL, message text NOT NULL, created_at timestamptz DEFAULT now() NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS newsletter_subscribers (id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL, email varchar(255) NOT NULL UNIQUE, created_at timestamptz DEFAULT now() NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id)`,
  `CREATE INDEX IF NOT EXISTS verification_email_idx ON verification_codes(email)`,
  `CREATE INDEX IF NOT EXISTS campaigns_category_idx ON campaigns(category)`,
  `CREATE INDEX IF NOT EXISTS campaigns_city_idx ON campaigns(city)`,
  `CREATE INDEX IF NOT EXISTS campaigns_start_idx ON campaigns(start_at)`,
  `CREATE INDEX IF NOT EXISTS signup_user_idx ON campaign_signups(user_id)`,
];

async function main() {
  await sql.transaction(statements.map((statement) => sql.query(statement)));
  console.log(`Applied ${statements.length} Neon schema statements.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
