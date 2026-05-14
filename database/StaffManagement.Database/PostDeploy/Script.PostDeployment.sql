/*
Post-deployment script. Runs after every DACPAC publish. Idempotent —
each INSERT is gated by NOT EXISTS so reruns are safe.

Seeds five sample staff rows so a fresh deploy isn't completely empty
in demos / dev environments.
*/

IF NOT EXISTS (SELECT 1 FROM dbo.Staff WHERE StaffId = N'SM00001')
	INSERT INTO dbo.Staff (Id, StaffId, FullName, Birthday, Gender)
	VALUES (N'11111111-1111-1111-1111-111111111111', N'SM00001', N'Alice Cooper',  '1990-05-15', 1);

IF NOT EXISTS (SELECT 1 FROM dbo.Staff WHERE StaffId = N'SM00002')
	INSERT INTO dbo.Staff (Id, StaffId, FullName, Birthday, Gender)
	VALUES (N'22222222-2222-2222-2222-222222222222', N'SM00002', N'Bob Builder',   '1985-03-20', 1);

IF NOT EXISTS (SELECT 1 FROM dbo.Staff WHERE StaffId = N'SM00003')
	INSERT INTO dbo.Staff (Id, StaffId, FullName, Birthday, Gender)
	VALUES (N'33333333-3333-3333-3333-333333333333', N'SM00003', N'Carol Smith',   '1992-08-30', 2);

IF NOT EXISTS (SELECT 1 FROM dbo.Staff WHERE StaffId = N'SM00004')
	INSERT INTO dbo.Staff (Id, StaffId, FullName, Birthday, Gender)
	VALUES (N'44444444-4444-4444-4444-444444444444', N'SM00004', N'Diana Prince',  '1988-11-02', 2);

IF NOT EXISTS (SELECT 1 FROM dbo.Staff WHERE StaffId = N'SM00005')
	INSERT INTO dbo.Staff (Id, StaffId, FullName, Birthday, Gender)
	VALUES (N'55555555-5555-5555-5555-555555555555', N'SM00005', N'Ethan Hunt',    '1979-12-12', 1);
GO
