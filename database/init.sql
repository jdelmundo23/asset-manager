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
    PRINT ''Database [' + @dbName + N'] created successfully.'';
END
ELSE
BEGIN
    PRINT ''Database [' + @dbName + N'] already exists.'';
END';
EXEC sp_executesql @sql;

-- Create login and user for the database
SET @sql = N'
USE [' + @dbName + N'];

IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = N''' + @loginName + N''')
BEGIN
    CREATE LOGIN [' + @loginName + N'] WITH PASSWORD = N''' + @loginPassword + N''';
    PRINT ''Login [' + @loginName + N'] created successfully.'';
END
ELSE
BEGIN
    RAISERROR (''=== WARNING: Login [' + @loginName + N'] already exists. Password may differ. ==='', 10, 1);
END

IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = N''' + @loginName + N''')
BEGIN
    CREATE USER [' + @loginName + N'] FOR LOGIN [' + @loginName + N'];
    ALTER ROLE db_owner ADD MEMBER [' + @loginName + N'];
    PRINT ''User [' + @loginName + N'] created successfully and added to db_owner role.'';
END
ELSE
BEGIN
    PRINT ''Database user [' + @loginName + N'] already exists in database [' + @dbName + N'].'';
END
';
EXEC sp_executesql @sql;

-- Create tables
PRINT '=== Creating tables ===';
PRINT '';
SET @sql = N'
USE [' + @dbName + N'];

CREATE TABLE Locations (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    createdTime DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updatedTime DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    rowVersion ROWVERSION
);

CREATE TABLE Departments (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    createdTime DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updatedTime DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    rowVersion ROWVERSION
);

CREATE TABLE AssetTypes (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    createdTime DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updatedTime DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    rowVersion ROWVERSION
);

CREATE TABLE AssetModels (
    ID INT IDENTITY(100,1) PRIMARY KEY,
    typeID INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    vendor VARCHAR(50),
    createdTime DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updatedTime DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    rowVersion ROWVERSION,
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
    createdTime DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updatedTime DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    rowVersion ROWVERSION,
    CONSTRAINT chk_warranty_after_purchase CHECK (
        warrantyExp IS NULL OR purchaseDate IS NULL OR warrantyExp > purchaseDate
    ),
);

CREATE UNIQUE INDEX uq_asset_model_identifier_notnull
    ON Assets (modelID, identifier)
    WHERE identifier IS NOT NULL AND modelID IS NOT NULL;

CREATE TABLE Subnets (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    subnetPrefix VARCHAR(11) NOT NULL UNIQUE,
    locationID INT NULL FOREIGN KEY REFERENCES Locations(ID) ON DELETE SET NULL,
    createdTime DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updatedTime DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    rowVersion ROWVERSION
);

CREATE TABLE IPAddresses (
    ID INT IDENTITY(1000,1) PRIMARY KEY,
    hostNumber TINYINT NOT NULL,
    name VARCHAR(100),
    macAddress VARCHAR(24),
    assetID INT NULL FOREIGN KEY REFERENCES Assets(ID) ON DELETE SET NULL,
    note NVARCHAR(255),
    subnetID INT NOT NULL FOREIGN KEY REFERENCES Subnets(ID) ON DELETE CASCADE,
    UNIQUE (hostNumber, subnetID),
    createdTime DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updatedTime DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    rowVersion ROWVERSION
);

CREATE TABLE Sessions (
   sid NVARCHAR(255) NOT NULL PRIMARY KEY,
   session NVARCHAR(MAX) NOT NULL,
   expires DATETIME NOT NULL
);
';
EXEC sp_executesql @sql;

PRINT '=== Tables created ===';
PRINT '';


-- Insert seed data
PRINT '=== Inserting seed data ===';
PRINT '';
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
PRINT '=== Seed data inserted ===';
PRINT '';

-- Create update triggers

PRINT '=== Creating update triggers ===';
PRINT '';

-- Locations
SET @SQL = '
EXEC [' + @dbName + '].dbo.sp_executesql N''CREATE TRIGGER [dbo].[trg_Locations_UpdatedTime]
ON [dbo].[Locations]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF UPDATE(updatedTime) RETURN;

    UPDATE t
    SET updatedTime = SYSUTCDATETIME()
    FROM [dbo].[Locations] t
    INNER JOIN inserted i ON t.ID = i.ID;
END;''';
EXEC(@SQL);

-- Departments
SET @SQL = '
EXEC [' + @dbName + '].dbo.sp_executesql N''CREATE TRIGGER [dbo].[trg_Departments_UpdatedTime]
ON [dbo].[Departments]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF UPDATE(updatedTime) RETURN;

    UPDATE t
    SET updatedTime = SYSUTCDATETIME()
    FROM [dbo].[Departments] t
    INNER JOIN inserted i ON t.ID = i.ID;
END;''';
EXEC(@SQL);

-- AssetTypes
SET @SQL = '
EXEC [' + @dbName + '].dbo.sp_executesql N''CREATE TRIGGER [dbo].[trg_AssetTypes_UpdatedTime]
ON [dbo].[AssetTypes]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF UPDATE(updatedTime) RETURN;

    UPDATE t
    SET updatedTime = SYSUTCDATETIME()
    FROM [dbo].[AssetTypes] t
    INNER JOIN inserted i ON t.ID = i.ID;
END;''';
EXEC(@SQL);

-- AssetModels
SET @SQL = '
EXEC [' + @dbName + '].dbo.sp_executesql N''CREATE TRIGGER [dbo].[trg_AssetModels_UpdatedTime]
ON [dbo].[AssetModels]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF UPDATE(updatedTime) RETURN;

    UPDATE t
    SET updatedTime = SYSUTCDATETIME()
    FROM [dbo].[AssetModels] t
    INNER JOIN inserted i ON t.ID = i.ID;
END;''';
EXEC(@SQL);

-- Assets
SET @SQL = '
EXEC [' + @dbName + '].dbo.sp_executesql N''CREATE TRIGGER [dbo].[trg_Assets_UpdatedTime]
ON [dbo].[Assets]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF UPDATE(updatedTime) RETURN;

    UPDATE t
    SET updatedTime = SYSUTCDATETIME()
    FROM [dbo].[Assets] t
    INNER JOIN inserted i ON t.ID = i.ID;
END;''';
EXEC(@SQL);

-- Subnets
SET @SQL = '
EXEC [' + @dbName + '].dbo.sp_executesql N''CREATE TRIGGER [dbo].[trg_Subnets_UpdatedTime]
ON [dbo].[Subnets]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF UPDATE(updatedTime) RETURN;

    UPDATE t
    SET updatedTime = SYSUTCDATETIME()
    FROM [dbo].[Subnets] t
    INNER JOIN inserted i ON t.ID = i.ID;
END;''';
EXEC(@SQL);

-- IPAddresses
SET @SQL = '
EXEC [' + @dbName + '].dbo.sp_executesql N''CREATE TRIGGER [dbo].[trg_IPAddresses_UpdatedTime]
ON [dbo].[IPAddresses]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF UPDATE(updatedTime) RETURN;

    UPDATE t
    SET updatedTime = SYSUTCDATETIME()
    FROM [dbo].[IPAddresses] t
    INNER JOIN inserted i ON t.ID = i.ID;
END;''';
EXEC(@SQL);

PRINT '=== Update triggers created ===';
PRINT '';

PRINT '=== Database initialization script completed ===';