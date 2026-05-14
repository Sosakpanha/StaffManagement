CREATE PROCEDURE dbo.SearchStaff
	@StaffId      nvarchar(8)   = NULL,
	@Gender       tinyint       = NULL,
	@BirthdayFrom date          = NULL,
	@BirthdayTo   date          = NULL,
	@FullName     nvarchar(100) = NULL,
	@Page         int           = 1,
	@PageSize     int           = 20,
	@SortBy       nvarchar(20)  = N'FullName',
	@SortDir      nvarchar(4)   = N'asc',
	@TotalCount   int OUTPUT
AS
BEGIN
	SET NOCOUNT ON;

	IF @Page < 1     SET @Page     = 1;
	IF @PageSize < 1 SET @PageSize = 20;
	IF @PageSize > 1000 SET @PageSize = 1000;

	DECLARE @Offset int = (@Page - 1) * @PageSize;

	-- Whitelist the sort column so the dynamic ORDER BY is safe.
	DECLARE @SortColumn nvarchar(20) =
		CASE LOWER(@SortBy)
			WHEN N'staffid'   THEN N'StaffId'
			WHEN N'fullname'  THEN N'FullName'
			WHEN N'birthday'  THEN N'Birthday'
			WHEN N'gender'    THEN N'Gender'
			WHEN N'createdat' THEN N'CreatedAt'
			ELSE N'FullName'
		END;

	DECLARE @SortDirection nvarchar(4) =
		CASE WHEN LOWER(@SortDir) = N'desc' THEN N'DESC' ELSE N'ASC' END;

	-- Total count of the filtered set (ignores paging). Soft-deleted rows are
	-- excluded everywhere via IsDeleted = 0.
	SELECT @TotalCount = COUNT(*)
	FROM dbo.Staff
	WHERE IsDeleted = 0
	  AND (@StaffId      IS NULL OR StaffId  LIKE N'%' + @StaffId  + N'%')
	  AND (@Gender       IS NULL OR Gender    = @Gender)
	  AND (@BirthdayFrom IS NULL OR Birthday >= @BirthdayFrom)
	  AND (@BirthdayTo   IS NULL OR Birthday <= @BirthdayTo)
	  AND (@FullName     IS NULL OR FullName LIKE N'%' + @FullName + N'%');

	-- Paged rows. @SortColumn and @SortDirection come from the whitelists above,
	-- so the dynamic SQL is safe; user-supplied values flow through sp_executesql.
	DECLARE @Sql nvarchar(max) = N'
		SELECT Id, StaffId, FullName, Birthday, Gender, CreatedAt, UpdatedAt
		FROM dbo.Staff
		WHERE IsDeleted = 0
		  AND (@StaffId      IS NULL OR StaffId  LIKE N''%'' + @StaffId  + N''%'')
		  AND (@Gender       IS NULL OR Gender    = @Gender)
		  AND (@BirthdayFrom IS NULL OR Birthday >= @BirthdayFrom)
		  AND (@BirthdayTo   IS NULL OR Birthday <= @BirthdayTo)
		  AND (@FullName     IS NULL OR FullName LIKE N''%'' + @FullName + N''%'')
		ORDER BY ' + QUOTENAME(@SortColumn) + N' ' + @SortDirection + N'
		OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;';

	EXEC sp_executesql @Sql,
		N'@StaffId nvarchar(8), @Gender tinyint, @BirthdayFrom date, @BirthdayTo date,
		  @FullName nvarchar(100), @Offset int, @PageSize int',
		@StaffId, @Gender, @BirthdayFrom, @BirthdayTo, @FullName, @Offset, @PageSize;
END;
GO
