CREATE TABLE dbo.Staff
(
    Id        uniqueidentifier NOT NULL CONSTRAINT PK_Staff PRIMARY KEY,
    StaffId   nvarchar(8)      NOT NULL,
    FullName  nvarchar(100)    NOT NULL,
    Birthday  date             NOT NULL,
    Gender    tinyint          NOT NULL CONSTRAINT CK_Staff_Gender CHECK (Gender IN (1, 2)),
    CreatedAt datetime2(3)     NOT NULL CONSTRAINT DF_Staff_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt datetime2(3)     NOT NULL CONSTRAINT DF_Staff_UpdatedAt DEFAULT SYSUTCDATETIME()
);
GO

CREATE UNIQUE INDEX UX_Staff_StaffId ON dbo.Staff (StaffId);
GO
