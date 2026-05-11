CREATE TABLE dbo.Users
(
    Id           uniqueidentifier NOT NULL CONSTRAINT PK_Users PRIMARY KEY,
    Username     nvarchar(50)     NOT NULL,
    PasswordHash nvarchar(200)    NOT NULL,
    Role         nvarchar(20)     NOT NULL CONSTRAINT DF_Users_Role      DEFAULT N'Admin',
    CreatedAt    datetime2(3)     NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT SYSUTCDATETIME()
);
GO

CREATE UNIQUE INDEX UX_Users_Username ON dbo.Users (Username);
GO
