CREATE PROCEDURE dbo.GetStaffById
	@Id uniqueidentifier
AS
BEGIN
	SET NOCOUNT ON;

	SELECT Id, StaffId, FullName, Birthday, Gender, CreatedAt, UpdatedAt
	FROM dbo.Staff
	WHERE Id = @Id;
END;
GO
