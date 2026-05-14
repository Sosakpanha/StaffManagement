namespace StaffManagement.Api.Entities;

/// <summary>
/// Database row for dbo.Staff.
/// </summary>
public class Staff
{
	public Guid Id { get; set; }
	public string StaffId { get; set; } = string.Empty;
	public string FullName { get; set; } = string.Empty;
	public DateOnly Birthday { get; set; }
	public int Gender { get; set; }
	public DateTime CreatedAt { get; set; }
	public DateTime UpdatedAt { get; set; }
}
