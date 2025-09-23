-- ==========================================================
-- Smart Authenium — full schema + seed (ALL-IN-ONE)
-- DB name uses your exact casing: smart_Authenium
-- ==========================================================

-- 0) Create and select DB
CREATE DATABASE IF NOT EXISTS smart_Authenium
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE smart_Authenium;

-- 1) Users & Auth -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  role          ENUM('student','teacher','admin') NOT NULL,
  email         VARCHAR(191) NOT NULL UNIQUE,
  full_name     VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  grade_code    VARCHAR(10) NULL,        -- e.g. G8..G12 for students
  subject_main  VARCHAR(100) NULL,       -- e.g. Mathematics for teachers
  avatar_url    TEXT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Password reset tokens (Forgot Password flow)
CREATE TABLE IF NOT EXISTS password_resets (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  token      CHAR(64) NOT NULL UNIQUE,   -- you can store a hashed token instead
  expires_at DATETIME NOT NULL,
  used       TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 2) Taxonomy: Grades & Subjects -------------------------------------------
CREATE TABLE IF NOT EXISTS grades (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  code  VARCHAR(10) NOT NULL UNIQUE,     -- G8..G12
  name  VARCHAR(50) NOT NULL             -- "Grade 8".. "Grade 12"
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS subjects (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(100) NOT NULL UNIQUE     -- Mathematics, Accounting, etc.
) ENGINE=InnoDB;

-- 3) Classrooms -------------------------------------------------------------
-- A classroom = (grade x subject), optionally owned by a teacher
CREATE TABLE IF NOT EXISTS classrooms (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  grade_id    INT NOT NULL,
  subject_id  INT NOT NULL,
  teacher_id  INT NULL,
  title       VARCHAR(150) NULL,         -- friendly name shown in UI
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (grade_id)   REFERENCES grades(id)   ON DELETE RESTRICT,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE RESTRICT,
  FOREIGN KEY (teacher_id) REFERENCES users(id)    ON DELETE SET NULL,
  UNIQUE KEY uniq_grade_subject_teacher (grade_id, subject_id, teacher_id)
) ENGINE=InnoDB;

-- 4) Enrollments (student ↔ classroom) -------------------------------------
CREATE TABLE IF NOT EXISTS enrollments (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  classroom_id  INT NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_user_classroom (user_id, classroom_id),
  FOREIGN KEY (user_id)      REFERENCES users(id)      ON DELETE CASCADE,
  FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5) Content (notes, textbooks, videos, quizzes, pdf, link) ----------------
CREATE TABLE IF NOT EXISTS content_items (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  classroom_id  INT NOT NULL,
  title         VARCHAR(200) NOT NULL,
  type          ENUM('textbook','video','quiz','pdf','link','note') NOT NULL,
  description   TEXT NULL,
  url           TEXT NULL,               -- main URL or preview link
  created_by    INT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by)   REFERENCES users(id)       ON DELETE SET NULL,
  INDEX idx_content_classroom (classroom_id),
  INDEX idx_content_type (type)
) ENGINE=InnoDB;

-- Optional: multiple files per content item (device/Drive/etc.)
CREATE TABLE IF NOT EXISTS content_files (
  id               BIGINT AUTO_INCREMENT PRIMARY KEY,
  content_id       BIGINT NOT NULL,
  file_url         TEXT NOT NULL,
  preview_url      TEXT NULL,
  storage_provider ENUM('device','drive','dropbox','other') NOT NULL DEFAULT 'device',
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (content_id) REFERENCES content_items(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6) Assignments & Submissions ---------------------------------------------
CREATE TABLE IF NOT EXISTS assignments (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  classroom_id  INT NOT NULL,
  title         VARCHAR(200) NOT NULL,
  instructions  TEXT NULL,
  due_at        DATETIME NULL,
  created_by    INT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by)   REFERENCES users(id)       ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS submissions (
  id             BIGINT AUTO_INCREMENT PRIMARY KEY,
  assignment_id  BIGINT NOT NULL,
  student_id     INT NOT NULL,
  file_url       TEXT NULL,
  text_answer    MEDIUMTEXT NULL,
  submitted_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  grade_value    DECIMAL(5,2) NULL,      -- 0..100 (or your scale)
  graded_at      DATETIME NULL,
  graded_by      INT NULL,
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id)    REFERENCES users(id)       ON DELETE CASCADE,
  FOREIGN KEY (graded_by)     REFERENCES users(id)       ON DELETE SET NULL,
  UNIQUE KEY uniq_submission (assignment_id, student_id)
) ENGINE=InnoDB;

-- 7) Activities feed (Teacher dashboard "Recent Activity") -----------------
CREATE TABLE IF NOT EXISTS activities (
  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NULL,                  -- who performed the action
  classroom_id INT NULL,                  -- which class it relates to
  subject_name VARCHAR(100) NULL,         -- denormalized convenience
  title        VARCHAR(255) NOT NULL,     -- e.g. "Uploaded: Quadratic Functions"
  type         VARCHAR(50)  NOT NULL,     -- 'upload','drive','dropbox','grade','schedule'
  metadata     JSON NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)      REFERENCES users(id)      ON DELETE SET NULL,
  FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE SET NULL,
  INDEX idx_activity_created (created_at)
) ENGINE=InnoDB;

-- 8) Uploads registry (record files you store anywhere) --------------------
CREATE TABLE IF NOT EXISTS uploads (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NULL,
  file_name     VARCHAR(255) NOT NULL,
  file_url      TEXT NOT NULL,
  mime_type     VARCHAR(120) NULL,
  size_bytes    BIGINT NULL,
  provider      ENUM('device','drive','dropbox','other') NOT NULL DEFAULT 'device',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 9) FAQ (optional data-driven FAQ page) -----------------------------------
CREATE TABLE IF NOT EXISTS faq (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  question    VARCHAR(255) NOT NULL,
  answer      MEDIUMTEXT NOT NULL,
  is_active   TINYINT(1) NOT NULL DEFAULT 1,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================
-- SEED DATA
-- =========================

-- Grades G8..G12
INSERT IGNORE INTO grades (id, code, name) VALUES
  (1,'G8','Grade 8'),
  (2,'G9','Grade 9'),
  (3,'G10','Grade 10'),
  (4,'G11','Grade 11'),
  (5,'G12','Grade 12');

-- Subjects used across your pages
INSERT IGNORE INTO subjects (id, name) VALUES
  (1,'Mathematics'),
  (2,'Maths Literacy'),
  (3,'History'),
  (4,'Accounting'),
  (5,'Geography'),
  (6,'Agricultural Science'),
  (7,'Tourism'),
  (8,'Physical Science'),
  (9,'Life Sciences');

-- Demo teacher (placeholder hash; create real users via /api/auth/register)
INSERT IGNORE INTO users (id, role, email, full_name, password_hash, subject_main)
VALUES (1,'teacher','teacher@example.com','Demo Teacher','$2a$10$abcdefghijklmnopqrstuv','Mathematics');

-- One Grade 10 classroom per subject owned by Demo Teacher
INSERT IGNORE INTO classrooms (id, grade_id, subject_id, teacher_id, title) VALUES
  (101,3,1,1,'Grade 10 Mathematics'),
  (102,3,2,1,'Grade 10 Maths Literacy'),
  (103,3,3,1,'Grade 10 History'),
  (104,3,4,1,'Grade 10 Accounting'),
  (105,3,5,1,'Grade 10 Geography'),
  (106,3,6,1,'Grade 10 Agricultural Science'),
  (107,3,7,1,'Grade 10 Tourism'),
  (108,3,8,1,'Grade 10 Physical Science'),
  (109,3,9,1,'Grade 10 Life Sciences');

-- Example content items for Maths (G10)
INSERT IGNORE INTO content_items (classroom_id, title, type, description, url, created_by)
VALUES
  (101,'Grade 10 Maths Textbook (PDF)','pdf','Core textbook','https://example.com/g10-maths.pdf',1),
  (101,'Linear Equations Video','video','Intro to linear equations','https://www.youtube.com/watch?v=dQw4w9WgXcQ',1),
  (101,'Algebra Quiz 1','quiz','Practice quiz on algebra',NULL,1);

-- Activities sample for dashboard feed
INSERT IGNORE INTO activities (user_id, classroom_id, subject_name, title, type, metadata)
VALUES
  (1,101,'Mathematics','Uploaded: Grade 10 Maths Textbook','upload', JSON_OBJECT('ext','pdf')),
  (1,101,'Mathematics','Added: Linear Equations Video','upload', JSON_OBJECT('provider','youtube'));

-- Optional FAQ seed
INSERT IGNORE INTO faq (id, question, answer, is_active, sort_order) VALUES
  (1,'How do I reset my password?','Use the Forgot Password page; a reset email will be sent to you.',1,1),
  (2,'How do I upload materials?','Teachers can upload via their dashboard → Quick Actions → Add Content.',1,2);
