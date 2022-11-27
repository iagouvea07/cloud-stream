CREATE DATABASE stream;

CREATE TABLE users (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) not null,
    email VARCHAR(100) not null,
    user VARCHAR(20) not null,
    password VARCHAR(60),
    active int DEFAULT 0,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tempPass varchar(15)
);

CREATE TABLE sessions (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user VARCHAR(50),
    cookie VARCHAR(200),
    iat int
);