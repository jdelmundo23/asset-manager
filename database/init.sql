-- Create the database ("AssetInventory" can be changed to a preferred database name)
CREATE DATABASE AssetInventory;
GO

-- Switch to the database
USE AssetInventory;
GO

CREATE TABLE Locations (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);
GO

CREATE TABLE Departments (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);
GO

-- (needed before AssetModels due to FK dependency)
CREATE TABLE AssetTypes (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);
GO

CREATE TABLE AssetModels (
    ID INT IDENTITY(100,1) PRIMARY KEY,
    typeID INT NULL FOREIGN KEY REFERENCES AssetTypes(ID) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL UNIQUE,
    vendor VARCHAR(100)
);
GO

-- (needed before IPAddresses due to FK dependency)
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
GO

-- (after Assets)
CREATE TABLE IPAddresses (
    ID INT IDENTITY(1000,1) PRIMARY KEY,
    ipAddress VARCHAR(15) NOT NULL UNIQUE,
    name VARCHAR(100),
    macAddress VARCHAR(24),
    assetID INT NULL FOREIGN KEY REFERENCES Assets(ID) ON DELETE SET NULL,
    note NVARCHAR(255)
);
GO