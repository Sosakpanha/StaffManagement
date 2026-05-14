CREATE TABLE dbo.Staff
(
    Id        uniqueidentifier NOT NULL CONSTRAINT PK_Staff PRIMARY KEY,
    StaffId   nvarchar(8)      NOT NULL,
    FullName  nvarchar(100)    NOT NULL,
    Birthday  date             NOT NULL,
    Gender    tinyint          NOT NULL CONSTRAINT CK_Staff_Gender CHECK (Gender IN (1, 2)),
    IsDeleted bit              NOT NULL CONSTRAINT DF_Staff_IsDeleted DEFAULT 0,
    DeletedAt datetime2(3)     NULL,
    CreatedAt datetime2(3)     NOT NULL CONSTRAINT DF_Staff_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt datetime2(3)     NOT NULL CONSTRAINT DF_Staff_UpdatedAt DEFAULT SYSUTCDATETIME()
);
GO

-- Filtered unique index: a StaffId is unique only among non-deleted rows,
-- so a deleted staff's StaffId can be reused later.
CREATE UNIQUE INDEX UX_Staff_StaffId
ON dbo.Staff (StaffId)
WHERE IsDeleted = 0;
GO

-- Search-supporting indexes. Both are filtered on IsDeleted = 0 because
-- every read path adds that predicate, so the optimizer can use these
-- without an extra residual filter.
CREATE INDEX IX_Staff_FullName
ON dbo.Staff (FullName)
WHERE IsDeleted = 0;
GO

CREATE INDEX IX_Staff_Birthday
ON dbo.Staff (Birthday)
WHERE IsDeleted = 0;
GO
