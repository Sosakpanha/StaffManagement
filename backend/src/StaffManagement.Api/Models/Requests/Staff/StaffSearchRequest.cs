namespace StaffManagement.Api.Models.Requests.Staff;

/// <summary>
/// Query parameters for advanced search and export. All filters are optional;
/// when omitted, the corresponding criterion does not narrow the result set.
/// </summary>
public class StaffSearchRequest
{
	public string? StaffId { get; set; }
	public int? Gender { get; set; }
	public DateOnly? BirthdayFrom { get; set; }
	public DateOnly? BirthdayTo { get; set; }
	public string? FullName { get; set; }
	public int Page { get; set; } = 1;
	public int PageSize { get; set; } = 20;
	public string SortBy { get; set; } = "FullName";
	public string SortDir { get; set; } = "asc";
}
