-- ==========================================
-- 1. SECURITY & ROLES
-- ==========================================
-- Create the restricted student user
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'selectStar') THEN
        CREATE USER "selectStar" WITH PASSWORD 'pass1234';
    END IF;
END
$$;

 -- create a dedicated schema for app data
CREATE SCHEMA IF NOT EXISTS app_data;

-- ==========================================
-- 2. APP METADATA (The "Answer Key")
-- ==========================================

-- Creating the table metadata table for challenges table
CREATE TABLE IF NOT EXISTS app_data.table_metadata (
    id SERIAL PRIMARY KEY ,
    table_name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS app_data.challenges (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    difficulty INT,
    solution_sql TEXT NOT NULL,
    category VARCHAR(50),
    table_id INTEGER REFERENCES app_data.table_metadata(id)
);

CREATE TABLE IF NOT EXISTS app_data.challengestotable(
    challenge_id INTEGER REFERENCES app_data.challenges(id),
    table_id INTEGER REFERENCES app_data.table_metadata(id),
    PRIMARY KEY (challenge_id, table_id),

    CONSTRAINT fk_challenge
        FOREIGN KEY(challenge_id)
            REFERENCES app_data.challenges(id)
            ON DELETE CASCADE,
    CONSTRAINT fk_table
        FOREIGN KEY(table_id)
            REFERENCES app_data.table_metadata(id)
            ON DELETE CASCADE
);


-- Seed initial challenges + 5 New Challenges
INSERT INTO app_data.challenges (title, description, solution_sql, difficulty, category) VALUES 
('High Earners', 'Find names of employees earning more than 100,000.', 'SELECT name FROM employees WHERE salary > 100000', 1, 'Filtering'),
('Recent Hires', 'List employees hired in the last 6 months.', 'SELECT name FROM employees WHERE hire_date >= CURRENT_DATE - INTERVAL ''6 months''', 2, 'Date Functions'),
('The Design Team', 'List all employees in the Design department.', 'SELECT e.name FROM employees e JOIN departments d ON e.department_id = d.id WHERE d.dept_name = ''Design''', 3, 'Joins'),

-- NEW CHALLENGE 4: Aggregation
('Average Salary', 'Calculate the average salary across the entire company.', 'SELECT AVG(salary) FROM employees', 1, 'Aggregation'),

-- NEW CHALLENGE 5: Pattern Matching
('The "A" Team', 'Find all employees whose name starts with the letter "A".', 'SELECT * FROM employees WHERE name LIKE ''A%''', 1, 'Basic SQL'),

-- NEW CHALLENGE 6: Grouping & Count
('Department Headcount', 'Count how many employees are in each department. Show department ID and the count.', 'SELECT department_id, COUNT(*) FROM employees GROUP BY department_id', 2, 'Aggregation'),

-- NEW CHALLENGE 7: Sorting & Limits
('Top 5 Earners', 'List the names and salaries of the top 5 highest-paid employees.', 'SELECT name, salary FROM employees ORDER BY salary DESC LIMIT 5', 2, 'Sorting'),

-- NEW CHALLENGE 8: Complex Join
('Marketing Budget', 'Find the total salary spend for the Marketing department.', 'SELECT SUM(e.salary) FROM employees e JOIN departments d ON e.department_id = d.id WHERE d.dept_name = ''Marketing''', 3, 'Joins')
ON CONFLICT DO NOTHING;

-- ==========================================
-- 3. PRACTICE DATA (The Playground)
-- ==========================================

-- 1. Create the Practice Tables (Schema)
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    dept_name VARCHAR(50) NOT NULL,
    manager_id INTEGER
);

CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department_id INTEGER REFERENCES departments(id),
    salary INTEGER,
    hire_date DATE DEFAULT CURRENT_DATE
);

-- 2. Insert Departments
INSERT INTO departments (dept_name, manager_id) VALUES 
('Engineering', 1), ('Design', 2), ('Marketing', 15), ('Sales', 30), ('Human Resources', 45)
ON CONFLICT DO NOTHING;

-- 3. Insert Employees
INSERT INTO employees (name, department_id, salary, hire_date) VALUES 
('Alice Johnson', 1, 105000, '2021-01-15'), ('Bob Smith', 1, 88000, '2021-03-20'),
('Charlie Brown', 2, 75000, '2022-05-10'), ('Diana Prince', 2, 115000, '2020-11-01'),
('Edward Norton', 3, 62000, '2023-08-15'), ('Fiona Gallagher', 4, 72000, '2022-02-14'),
('George Miller', 1, 98000, '2021-09-30'), ('Hannah Abbott', 5, 55000, '2023-01-10'),
('Ian Wright', 4, 85000, '2020-05-25'), ('Jane Foster', 1, 120000, '2019-12-01'),
('Kevin Hart', 3, 58000, '2024-02-10'), ('Laura Palmer', 2, 82000, '2021-06-18'),
('Mike Wazowski', 4, 69000, '2022-11-20'), ('Nina Simone', 5, 64000, '2020-04-12'),
('Oscar Isaac', 3, 91000, '2021-10-05'), ('Peter Parker', 1, 74000, '2023-03-12'),
('Quinn Fabray', 2, 79000, '2022-07-22'), ('Riley Reid', 4, 88000, '2021-01-05'),
('Steve Rogers', 1, 130000, '2018-05-15'), ('Tony Stark', 1, 250000, '2015-01-01'),
('Ursula Corbero', 3, 85000, '2022-09-14'), ('Victor Stone', 1, 92000, '2021-12-10'),
('Wanda Maximoff', 2, 108000, '2020-08-25'), ('Xavier Renegade', 4, 52000, '2024-01-05'),
('Yara Shahidi', 5, 67000, '2022-04-30'), ('Zoe Kravitz', 2, 95000, '2021-02-14')
ON CONFLICT DO NOTHING;

-- Generate remaining rows dynamically for a total of 1000
INSERT INTO employees (name, department_id, salary, hire_date)
SELECT 
    'Employee_' || i, 
    (floor(random() * 5) + 1)::int, 
    (floor(random() * 50000) + 40000)::int,
    CURRENT_DATE - (floor(random() * 2000))::int
FROM generate_series(27, 1000) AS i
ON CONFLICT DO NOTHING;

-- Insert table metadata for departments and employees
INSERT INTO app_data.table_metadata (table_name) VALUES 
('departments'),
('employees')
ON CONFLICT DO NOTHING;

-- Mapping New Challenges to the required tables
-- (Note: Using subqueries to ensure correct IDs are mapped regardless of SERIAL order)
INSERT INTO app_data.challengestotable (challenge_id, table_id) 
SELECT c.id, tm.id 
FROM app_data.challenges c, app_data.table_metadata tm
WHERE (c.title = 'High Earners' AND tm.table_name = 'employees')
   OR (c.title = 'Recent Hires' AND tm.table_name = 'employees')
   OR (c.title = 'Average Salary' AND tm.table_name = 'employees')
   OR (c.title = 'The "A" Team' AND tm.table_name = 'employees')
   OR (c.title = 'Department Headcount' AND tm.table_name = 'employees')
   OR (c.title = 'Top 5 Earners' AND tm.table_name = 'employees')
   OR (c.title = 'The Design Team' AND tm.table_name IN ('employees', 'departments'))
   OR (c.title = 'Marketing Budget' AND tm.table_name IN ('employees', 'departments'))
ON CONFLICT DO NOTHING;

-- ==========================================
-- 4. FINAL PERMISSIONS
-- ==========================================
-- Standard security hardening
REVOKE ALL ON SCHEMA app_data FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA app_data FROM PUBLIC;
REVOKE ALL ON SCHEMA app_data FROM "selectStar";
REVOKE ALL ON ALL TABLES IN SCHEMA app_data FROM "selectStar";

-- Redirect student to public schema and grant access to practice data
ALTER ROLE "selectStar" SET search_path = public;
GRANT USAGE ON SCHEMA public TO "selectStar";
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO "selectStar";