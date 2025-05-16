-- ========================================
-- CONFIGURATION VARIABLES (EDIT THESE) -
-- ========================================
DECLARE @dbName NVARCHAR(128)        = N'testassets';
DECLARE @loginName NVARCHAR(128)     = N'testaccount12345';
DECLARE @loginPassword NVARCHAR(128) = N'changethis#123';
-- ========================================

-- Create the database if it doesn't exist
DECLARE @sql NVARCHAR(MAX);
SET @sql = N'
IF DB_ID(N''' + @dbName + N''') IS NULL
BEGIN
    CREATE DATABASE [' + @dbName + N'];
END';
EXEC sp_executesql @sql;

-- Switch to the new database dynamically
SET @sql = N'USE [' + @dbName + N'];';
EXEC sp_executesql @sql;

-- Execute table creation and login/user setup
SET @sql = N'
USE [' + @dbName + N'];

-- Create Tables
CREATE TABLE Locations (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE Departments (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE AssetTypes (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE AssetModels (
    ID INT IDENTITY(100,1) PRIMARY KEY,
    typeID INT NULL FOREIGN KEY REFERENCES AssetTypes(ID) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL UNIQUE,
    vendor VARCHAR(100)
);

CREATE TABLE Assets (
    ID INT IDENTITY(10000,1) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    identifier VARCHAR(100),
    locationID INT NULL FOREIGN KEY REFERENCES Locations(ID) ON DELETE SET NULL,
    departmentID INT NULL FOREIGN KEY REFERENCES Departments(ID) ON DELETE SET NULL,
    modelID INT NULL FOREIGN KEY REFERENCES AssetModels(ID) ON DELETE SET NULL,
    assignedTo VARCHAR(75),
    purchaseDate DATETIME,
    warrantyExp DATETIME,
    cost DECIMAL(6,2),
    note NVARCHAR(255)
);

CREATE TABLE IPAddresses (
    ID INT IDENTITY(1000,1) PRIMARY KEY,
    ipAddress VARCHAR(15) NOT NULL UNIQUE,
    name VARCHAR(100),
    macAddress VARCHAR(24),
    assetID INT NULL FOREIGN KEY REFERENCES Assets(ID) ON DELETE SET NULL,
    note NVARCHAR(255)
);

-- Create login and user for the database
IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = N''' + @loginName + N''')
BEGIN
    CREATE LOGIN [' + @loginName + N'] WITH PASSWORD = N''' + @loginPassword + N''';
END
ELSE
BEGIN
    RAISERROR (''=== WARNING: Login [' + @loginName + N'] already exists. Password may differ. ==='', 10, 1);
END

IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = N''' + @loginName + N''')
BEGIN
    CREATE USER [' + @loginName + N'] FOR LOGIN [' + @loginName + N'];
    ALTER ROLE db_owner ADD MEMBER [' + @loginName + N'];
END
ELSE
BEGIN
    PRINT ''Database user [' + @loginName + N'] already exists in database [' + @dbName + N'].'';
END

-- Insert seed data
INSERT INTO Locations (name) VALUES (''Main Office'');
INSERT INTO Departments (name) VALUES (''IT Department'');
INSERT INTO AssetTypes (name) VALUES (''Laptop'');

INSERT INTO AssetModels (typeID, name, vendor)
VALUES (
    (SELECT ID FROM AssetTypes WHERE name = ''Laptop''),
    ''ThinkPad T14'',
    ''Lenovo''
);

INSERT INTO Assets (
    name,
    identifier,
    locationID,
    departmentID,
    modelID,
    assignedTo,
    purchaseDate,
    warrantyExp,
    cost,
    note
)
VALUES (
    ''Office Laptop 1'',
    ''LT-001'',
    (SELECT ID FROM Locations WHERE name = ''Main Office''),
    (SELECT ID FROM Departments WHERE name = ''IT Department''),
    (SELECT ID FROM AssetModels WHERE name = ''ThinkPad T14''),
    ''jdoe@example.com'',
    ''2024-01-15'',
    ''2027-01-15'',
    1500.00,
    ''Assigned to John Doe for development use.''
);

INSERT INTO IPAddresses (
    ipAddress,
    name,
    macAddress,
    assetID,
    note
)
VALUES (
    ''192.168.1.100'',
    ''Laptop NIC'',
    ''00-14-22-01-23-45'',
    (SELECT ID FROM Assets WHERE identifier = ''LT-001''),
    ''Static IP for laptop''
);
';

EXEC sp_executesql @sql;
