namespace StaffManagement.Api.Enums;

/// <summary>
/// Stable error codes returned to API clients in the JSON error envelope.
/// Numeric values match the THROW codes used in the database SPs so the
/// transport layer can map SQL exceptions to API errors unambiguously.
/// </summary>
public enum EnumApiError
{
	UnknownError     = 50000,
	DuplicateStaffId = 50001,
	StaffNotFound    = 50404,
	ValidationFailed = 40000
}
