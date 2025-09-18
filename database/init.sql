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

-- Create login and user for the database
SET @sql = N'
USE [' + @dbName + N'];

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
';
EXEC sp_executesql @sql;

-- Create Tables
SET @sql = N'
USE [' + @dbName + N'];

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
    typeID INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    vendor VARCHAR(50),
    CONSTRAINT uq_model_type UNIQUE (name, typeID),
    CONSTRAINT FK_AssetModels_AssetTypes FOREIGN KEY (typeID)
        REFERENCES AssetTypes(ID)
);

CREATE TABLE Users (
    ID UNIQUEIDENTIFIER PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    last_sync DATETIME2 NOT NULL,
    active BIT NOT NULL
);

CREATE TABLE StagingUsers (
    ID UNIQUEIDENTIFIER NOT NULL,
    name VARCHAR(255) NOT NULL,
    last_sync DATETIME2 NOT NULL,
    active BIT NOT NULL
);

CREATE TABLE Assets (
    ID INT IDENTITY(10000,1) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    identifier VARCHAR(100),
    locationID INT NULL FOREIGN KEY REFERENCES Locations(ID) ON DELETE SET NULL,
    departmentID INT NULL FOREIGN KEY REFERENCES Departments(ID) ON DELETE SET NULL,
    modelID INT NULL FOREIGN KEY REFERENCES AssetModels(ID) ON DELETE SET NULL,
    assignedTo UNIQUEIDENTIFIER NULL FOREIGN KEY REFERENCES Users(ID) ON DELETE SET NULL,
    purchaseDate DATETIME,
    warrantyExp DATETIME,
    cost DECIMAL(6,2),
    note NVARCHAR(255),
    CONSTRAINT chk_warranty_after_purchase CHECK (
        warrantyExp IS NULL OR purchaseDate IS NULL OR warrantyExp > purchaseDate
    ),
);

CREATE UNIQUE INDEX uq_asset_model_identifier_notnull
    ON Assets (modelID, identifier)
    WHERE identifier IS NOT NULL;

CREATE TABLE Subnets (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    subnetPrefix VARCHAR(11) NOT NULL UNIQUE,
    locationID INT NULL FOREIGN KEY REFERENCES Locations(ID) ON DELETE SET NULL
);

CREATE TABLE IPAddresses (
    ID INT IDENTITY(1000,1) PRIMARY KEY,
    hostNumber TINYINT NOT NULL,
    name VARCHAR(100),
    macAddress VARCHAR(24),
    assetID INT NULL FOREIGN KEY REFERENCES Assets(ID) ON DELETE SET NULL,
    note NVARCHAR(255),
    subnetID INT NOT NULL FOREIGN KEY REFERENCES Subnets(ID) ON DELETE CASCADE,
    UNIQUE (hostNumber, subnetID)
);
';
EXEC sp_executesql @sql;

-- Insert seed data
SET @sql = N'
USE [' + @dbName + N'];

INSERT INTO Locations (name) VALUES (''Main Office'');
INSERT INTO Departments (name) VALUES (''IT Department'');
INSERT INTO AssetTypes (name) VALUES (''Laptop'');

INSERT INTO AssetModels (typeID, name, vendor)
VALUES (
    (SELECT ID FROM AssetTypes WHERE name = ''Laptop''),
    ''ThinkPad T14'',
    ''Lenovo''
);

INSERT INTO Users (ID, name, last_sync, active)
VALUES (
    ''ffffffff-ffff-ffff-ffff-ffffffffffff'', 
    ''Test User'',
    GETUTCDATE(),
    0                                       
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
    ''ffffffff-ffff-ffff-ffff-ffffffffffff'',
    ''2024-01-15'',
    ''2027-01-15'',
    1500.00,
    ''Assigned to Test User for development use.''
);


INSERT INTO Subnets (subnetPrefix, locationID) VALUES (''192.168.1'', (SELECT ID FROM Locations WHERE name = ''Main Office''));

INSERT INTO IPAddresses (
    hostNumber,
    name,
    macAddress,
    assetID,
    note,
    subnetID
)
VALUES (
    100,
    ''Laptop NIC'',
    ''00-14-22-01-23-45'',
    (SELECT ID FROM Assets WHERE identifier = ''LT-001''),
    ''Static IP for laptop'',
    (SELECT ID FROM Subnets WHERE subnetPrefix = ''192.168.1'')
);
';
EXEC sp_executesql @sql;