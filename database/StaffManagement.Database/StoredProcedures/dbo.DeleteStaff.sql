CREATE PROCEDURE dbo.DeleteStaff
	@Id uniqueidentifier
AS
BEGIN
	SET NOCOUNT ON;

	DELETE FROM dbo.Staff WHERE Id = @Id;

	IF @@ROWCOUNT = 0
		THROW 50404, 'Staff not found.', 1;
END;
GO
