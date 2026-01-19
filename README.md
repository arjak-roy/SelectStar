# 🌟 SelectStar: Interactive SQL Mastery Platform

## 📖 1. Project Overview
**SelectStar** is a high-performance, full-stack learning platform engineered to bridge the gap between theoretical database concepts and practical execution. It provides a **secure, sandboxed environment** where users can execute complex relational queries against a live PostgreSQL instance without compromising system integrity 🛡️.

### ✨ Key Features
* **Interactive Query Playground:** Real-time SQL execution with dynamic result visualization 💻.
* **Advanced Security:** Industrial-grade **Schema Isolation** and **Role-Based Access Control (RBAC)**.
* **Challenge-Based Learning:** A curated set of SQL tasks ranging from basic filtering to complex joins.
* **Stateless Session Management:** Secure user authentication powered by **JWT**.

---

## 🛠️ 2. Technical Stack
The platform utilizes a modern, distributed architecture to ensure scalability and performance:
* **Frontend:** React.js for a responsive, dynamic UI.
* **Backend:** Node.js & Express 5 for robust server-side logic and routing.
* **Authentication:** Stateless JSON Web Tokens (JWT) for secure authorization.
* **Database:** PostgreSQL (Multi-schema architecture).
* **Infrastructure:** **Docker & Docker Compose** for seamless containerization and environment parity.

---

## 🗄️ 3. Database Architecture
The relational schema is meticulously designed to support multi-tenancy while maintaining strict data privacy through **Row-Level Security (RLS)**.

### 🗝️ Core Data Entities
* **`users`:** Manages secure profiles with hashed credentials.
* **`challenges`:** Stores the curriculum, difficulty levels, and hidden solution logic.
* **`user_progress`:** Tracks submissions and validates completed milestones.
* **`table_metadata`:** Drives the dynamic UI by providing structural info about challenge tables.

---

## 📡 4. API Endpoints

### 🔐 Authentication
* `POST /api/signup`: New user registration.
* `POST /api/login`: Secure authentication and JWT issuance.
* `GET /api/getme`: Fetching current authenticated profile (Protected).

### ⚡ SQL Execution Engine
* `POST /api/query`: Executes arbitrary SQL in a restricted sandbox.
* `POST /api/check/:id`: Validates user solutions using a **Ghost Comparison** algorithm.

### 🛠️ Admin Services
* `POST /admin/create-new-challenge`: For defining new relational tasks.
* `POST /admin/query-execution`: High-privilege debugging and maintenance.

---

## 🛡️ 5. Security & Middleware Stack
Security is baked into the request lifecycle via a robust middleware pipeline:

1.  **`verifyToken`:** Ensures only authorized users access protected resources.
2.  **`validateSQL`:** A critical gatekeeper that sanitizes raw SQL strings using **Regex filtering** to block destructive commands (e.g., `DROP`, `DELETE`).
3.  **CORS/Security:** Managed at the application level to ensure safe cross-origin communication.

---

## 🔄 6. The Validation Workflow (Ghost Comparison)
To determine if a user's SQL is "Correct," the engine performs the following:
1.  **Safety Check:** The `validateSQL` middleware screens for security violations.
2.  **Execution:** The system retrieves the secret `solution_sql`.
3.  **The Ghost Run:** Both the user's SQL and the solution SQL are executed within a **PostgreSQL Transaction**.
4.  **Verification:** The resulting JSON datasets are compared for equality.
5.  **Rollback:** The transaction is **REVERTED**, ensuring user queries never permanently alter the database state.
 
---

## ⚔️ 7. Battle ready testing with different vulnerable queries:

To ensure that the server returns a ***403 forbidden*** response code to unauthorised queries, we tested it against different queries:
 ### 1. Destructive Commands (DDL & DML) 🧨
1. **DROP TABLE users;** — Attempts to delete the core user table.
2. **DROP SCHEMA app_data CASCADE;** — Attempts to wipe the entire administrative schema.
3. **DELETE FROM challenges;** — Attempts to erase all available tasks.
4. **TRUNCATE app_data.user_progress;** — Attempts a high-speed wipe of user history.
5. **ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT TRUE;** — Attempts to modify the user schema for privilege escalation.

### 2. Unauthorized Data Modification ✍️
1. **INSERT INTO app_data.challenges (title, solution_sql) VALUES ('Hacked', 'SELECT 1');** — Attempts to inject a fake challenge.
2. **UPDATE users SET password_hash = 'new_hash' WHERE username = 'admin';** — Attempts to hijack the admin account.

### 3. Information Extraction (SQL Injection) 🔍
1. **SELECT name FROM employees UNION SELECT password_hash FROM app_data.users;** — Attempts a classic UNION attack to extract sensitive user hashes.
2. **SELECT * FROM employees, app_data.users;** — Uses a cross-join to expose hidden table data from the administrative schema.