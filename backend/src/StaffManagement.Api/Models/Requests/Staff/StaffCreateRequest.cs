using System.ComponentModel.DataAnnotations;

namespace StaffManagement.Api.Models.Requests.Staff;

public class StaffCreateRequest
{
	[Required, StringLength(8, MinimumLength = 1)]
	public string StaffId { get; set; } = string.Empty;

	[Required, StringLength(100, MinimumLength = 1)]
	public string FullName { get; set; } = string.Empty;

	[Required]
	public DateOnly Birthday { get; set; }

	[Range(1, 2)]
	public int Gender { get; set; }
}
