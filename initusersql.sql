-- ==========================================
-- USER SYSTEM INITIALIZATION
-- ==========================================

-- Ensure we are still using the app_data schema
CREATE SCHEMA IF NOT EXISTS app_data;

-- 1. Create the Users table
CREATE TABLE IF NOT EXISTS app_data.users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create the User Progress table (Junction Table)
CREATE TABLE IF NOT EXISTS app_data.user_progress (
    user_id INTEGER REFERENCES app_data.users(id) ON DELETE CASCADE,
    challenge_id INTEGER REFERENCES app_data.challenges(id) ON DELETE CASCADE,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_sql TEXT,
    PRIMARY KEY (user_id, challenge_id)
);

-- 3. Add index for faster progress lookups
CREATE INDEX idx_user_id ON app_data.user_progress(user_id);

-- 4. Re-apply permissions for the selectStar student user
-- (Because selectStar shouldn't see these tables either)
REVOKE ALL ON ALL TABLES IN SCHEMA app_data FROM "selectStar";
ALTER ROLE "selectStar" SET search_path = public;