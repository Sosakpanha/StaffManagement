CREATE PROCEDURE dbo.DeleteStaff
	@Id uniqueidentifier
AS
BEGIN
	SET NOCOUNT ON;

	IF NOT EXISTS (SELECT 1 FROM dbo.Staff WHERE Id = @Id AND IsDeleted = 0)
		THROW 50404, 'Staff not found.', 1;

	UPDATE dbo.Staff
	SET IsDeleted = 1,
	    DeletedAt = SYSUTCDATETIME(),
	    UpdatedAt = SYSUTCDATETIME()
	WHERE Id = @Id;

	SELECT Id, StaffId, FullName, Birthday, Gender, CreatedAt, UpdatedAt
	FROM dbo.Staff
	WHERE Id = @Id;
END;
GO
