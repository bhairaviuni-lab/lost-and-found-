-- ==========================================================
-- Campus Lost & Found System - MySQL Database Schema
-- Designed for 2nd Year Computer Engineering Final Project
-- ==========================================================

CREATE DATABASE IF NOT EXISTS campus_lost_found
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE campus_lost_found;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    college_email VARCHAR(150) NOT NULL UNIQUE,
    student_id VARCHAR(50) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('STUDENT', 'FACULTY', 'ADMIN') DEFAULT 'STUDENT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_email (college_email),
    INDEX idx_user_student_id (student_id)
) ENGINE=InnoDB;

-- 2. Items Table (Lost & Found Reports)
CREATE TABLE IF NOT EXISTS items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    report_id VARCHAR(50) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    item_name VARCHAR(150) NOT NULL,
    type ENUM('LOST', 'FOUND') NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    event_date DATE NOT NULL,
    approx_time VARCHAR(50),
    location VARCHAR(150) NOT NULL,
    color VARCHAR(50),
    brand VARCHAR(80),
    identifying_details TEXT,
    contact_preference ENUM('EMAIL', 'PHONE', 'PLATFORM') DEFAULT 'PLATFORM',
    image_url TEXT,
    status ENUM('OPEN', 'RESOLVED', 'CLAIMED') DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_item_type (type),
    INDEX idx_item_category (category),
    INDEX idx_item_status (status),
    INDEX idx_item_location (location),
    INDEX idx_item_report_id (report_id)
) ENGINE=InnoDB;

-- 3. Claims Table
CREATE TABLE IF NOT EXISTS claims (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_id BIGINT NOT NULL,
    claimant_user_id BIGINT NOT NULL,
    owner_user_id BIGINT NOT NULL,
    reason TEXT NOT NULL,
    additional_details TEXT,
    proof_details TEXT,
    status ENUM('PENDING', 'ACCEPTED', 'REJECTED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
    FOREIGN KEY (claimant_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_claim_item (item_id),
    INDEX idx_claim_claimant (claimant_user_id),
    INDEX idx_claim_status (status)
) ENGINE=InnoDB;

-- ==========================================================
-- Sample Demonstration Data (BCrypt hashes for 'Pass@123' / 'Admin@123')
-- ==========================================================

INSERT INTO users (id, full_name, college_email, student_id, phone, password_hash, role)
VALUES
(1, 'Prof. Ramesh Kulkarni (Admin)', 'admin@campus.edu', 'FAC-9901', '+91 98765 43210', '$2a$10$wO3n4Lkg9/aE1lX39g84A.Lz/W6z5aR7XyZ0kUq3u9l4Pq7OqI7.y', 'ADMIN'),
(2, 'Rahul Sharma', 'rahul.sharma@campus.edu', 'CS-2024-042', '+91 98234 56789', '$2a$10$wO3n4Lkg9/aE1lX39g84A.Lz/W6z5aR7XyZ0kUq3u9l4Pq7OqI7.y', 'STUDENT'),
(3, 'Priya Patel', 'priya.patel@campus.edu', 'IT-2024-088', '+91 97123 45678', '$2a$10$wO3n4Lkg9/aE1lX39g84A.Lz/W6z5aR7XyZ0kUq3u9l4Pq7OqI7.y', 'STUDENT')
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO items (id, report_id, user_id, item_name, type, category, description, event_date, approx_time, location, color, brand, identifying_details, contact_preference, image_url, status)
VALUES
(1, 'LOST-2026-1049', 2, 'Scientific Calculator Casio fx-991EX', 'LOST', 'Electronics', 'Lost during Applied Math Exam in Lecture Hall 3. Has a black case with small blue tape.', '2026-10-04', '12:30 PM', 'Lecture Hall 3 (Engineering Block)', 'Black & White', 'Casio', 'Initials "RS" lightly scratched on inner battery cover.', 'PLATFORM', 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80', 'OPEN'),
(2, 'FOUND-2026-2184', 3, 'Apple AirPods Pro (2nd Gen) with Spigen Case', 'FOUND', 'Electronics', 'Found on table 14 near the silent study section on 2nd floor Central Library.', '2026-10-05', '04:15 PM', 'Central Library, 2nd Floor Silent Zone', 'White (Matte Green Case)', 'Apple', 'Case has an anime keychain clip attached and small scratch on lid.', 'PLATFORM', 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80', 'OPEN'),
(3, 'FOUND-2026-3402', 2, 'Student RFID Identity Card (Computer Engg)', 'FOUND', 'ID Cards', 'Found dropped near Nescafe Canteen payment counter during lunch rush.', '2026-10-06', '01:45 PM', 'Main Canteen / Food Court', 'Blue Lanyard', 'University ID Card', 'Year 2024-2028, surname starts with "M". Handover upon verifying student portal.', 'PLATFORM', 'https://images.unsplash.com/photo-1589330694653-dad6ef0100f8?w=600&auto=format&fit=crop&q=80', 'OPEN'),
(4, 'LOST-2026-4890', 3, 'Dell XPS 13 USB-C Charger & HDMI Dongle', 'LOST', 'Electronics', 'Left plugged into wall outlet in Advanced Programming Lab (Lab 4B).', '2026-10-06', '11:00 AM', 'Computer Centre Lab 4B', 'Black with White Cable Tie', 'Dell', 'Dell 65W Type-C adapter with an Anker silver USB-C to HDMI adapter plugged in.', 'EMAIL', 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80', 'OPEN'),
(5, 'FOUND-2026-5511', 1, 'Set of 3 Keys with Honda Bike Key & Marvel Lanyard', 'FOUND', 'Keys', 'Handed to campus security gate #2 by parking attendant.', '2026-10-03', '09:00 AM', 'Two-Wheeler Student Parking Lot B', 'Silver / Red Lanyard', 'Honda', 'Iron Man helmet rubber keychain attached.', 'PHONE', 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80', 'RESOLVED')
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO claims (id, item_id, claimant_user_id, owner_user_id, reason, additional_details, proof_details, status)
VALUES
(1, 5, 2, 1, 'These are my spare Honda Shine bike keys and home locker keys that slipped from my pocket while parking in Lot B.', 'The Marvel Iron Man keychain has a slight tear on the bottom right helmet chin.', 'Vehicle registration number ends with 4921 matching my student registration pass.', 'ACCEPTED')
ON DUPLICATE KEY UPDATE id=id;
