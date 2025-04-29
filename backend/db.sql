-- create database
CREATE DATABASE IF NOT EXISTS social_app;
USE social_app;

-- Switch to the database
USE social_app;

-- Drop the table if it already exists (for easy resets during development)
DROP TABLE IF EXISTS users;

-- Create the users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE, -- Ensure emails are unique
    password_hash VARCHAR(255) NOT NULL, -- Store the hashed password
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Track when the user signed up
);

-- Optional: Add an index on the email column for faster lookups
CREATE INDEX idx_email ON users(email);