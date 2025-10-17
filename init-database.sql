-- Initialize serpate database for each microservice application
-- This script runs when the PostgreSQL container is started for the first time

-- Create database for each microservice

CREATE DATABASE microservice_auth;
CREATE DATABASE microservice_users;
CREATE DATABASE microservice_notes;
CREATE DATABASE microservice_tags;

-- Grant permisions to a dedicated user

GRANT ALL PRIVILEGES ON DATABASE microservice_auth TO microservice_user;
GRANT ALL PRIVILEGES ON DATABASE microservice_users TO microservice_user;
GRANT ALL PRIVILEGES ON DATABASE microservice_notes TO microservice_user;
GRANT ALL PRIVILEGES ON DATABASE microservice_tags TO microservice_user;