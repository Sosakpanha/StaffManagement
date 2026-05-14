CREATE PROCEDURE dbo.UpdateStaff
	@Id       uniqueidentifier,
	@StaffId  nvarchar(8),
	@FullName nvarchar(100),
	@Birthday date,
	@Gender   tinyint
AS
BEGIN
	SET NOCOUNT ON;

	IF NOT EXISTS (SELECT 1 FROM dbo.Staff WHERE Id = @Id AND IsDeleted = 0)
		THROW 50404, 'Staff not found.', 1;

	IF EXISTS (SELECT 1 FROM dbo.Staff WHERE StaffId = @StaffId AND Id <> @Id AND IsDeleted = 0)
		THROW 50001, 'Staff with this StaffId already exists.', 1;

	UPDATE dbo.Staff
	SET StaffId   = @StaffId,
	    FullName  = @FullName,
	    Birthday  = @Birthday,
	    Gender    = @Gender,
	    UpdatedAt = SYSUTCDATETIME()
	WHERE Id = @Id;

	SELECT Id, StaffId, FullName, Birthday, Gender, CreatedAt, UpdatedAt
	FROM dbo.Staff
	WHERE Id = @Id;
END;
GO
