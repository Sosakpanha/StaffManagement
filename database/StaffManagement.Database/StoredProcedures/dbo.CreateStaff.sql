CREATE PROCEDURE dbo.CreateStaff
	@StaffId  nvarchar(8),
	@FullName nvarchar(100),
	@Birthday date,
	@Gender   tinyint
AS
BEGIN
	SET NOCOUNT ON;

	IF EXISTS (SELECT 1 FROM dbo.Staff WHERE StaffId = @StaffId)
		THROW 50001, 'Staff with this StaffId already exists.', 1;

	DECLARE @Id uniqueidentifier = NEWID();

	INSERT INTO dbo.Staff (Id, StaffId, FullName, Birthday, Gender)
	VALUES (@Id, @StaffId, @FullName, @Birthday, @Gender);

	SELECT Id, StaffId, FullName, Birthday, Gender, CreatedAt, UpdatedAt
	FROM dbo.Staff
	WHERE Id = @Id;
END;
GO
