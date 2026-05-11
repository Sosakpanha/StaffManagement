/*
    Post-Deployment Script
    ----------------------
    Runs after every DACPAC publish. Must be idempotent.

    Seeds a default admin user for development.
    Username: admin
    Password: admin123  (BCrypt hash, cost factor 11)

    For production, replace this hash before deploying or skip the seed.
*/

IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE Username = N'admin')
BEGIN
    INSERT INTO dbo.Users (Id, Username, PasswordHash, Role)
    VALUES (
        NEWID(),
        N'admin',
        N'$2a$11$zh1oniCnog3/gmeI4lc5o.3zufAC5OuUHuBkfXSD4swn3VxCUCLDO',
        N'Admin'
    );

    PRINT 'Seeded admin user.';
END
ELSE
BEGIN
    PRINT 'Admin user already exists; skipping seed.';
END;
GO
