/*
Hard-delete soft-deleted rows older than @RetentionDays. Returns the
number of rows removed so the caller can log it.

Safe to run from multiple replicas; the DELETE is idempotent — whichever
replica wins simply reports 0 for the next.
*/
CREATE PROCEDURE dbo.PurgeSoftDeletedStaff
	@RetentionDays int,
	@PurgedCount   int OUTPUT
AS
BEGIN
	SET NOCOUNT ON;

	IF @RetentionDays < 0
		THROW 50000, 'RetentionDays must be >= 0.', 1;

	DECLARE @Cutoff datetime2(3) = DATEADD(day, -@RetentionDays, SYSUTCDATETIME());

	DELETE FROM dbo.Staff
	WHERE IsDeleted = 1
	  AND DeletedAt IS NOT NULL
	  AND DeletedAt < @Cutoff;

	SET @PurgedCount = @@ROWCOUNT;
END;
GO
