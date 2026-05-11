using StaffManagement.Api.Enums;

namespace StaffManagement.Api.Exceptions;

/// <summary>
/// Domain exception. The transport layer (ExceptionFilter) maps
/// <see cref="ErrorCode"/> to the appropriate HTTP status and surfaces
/// the code + message to the API client.
/// </summary>
public class ApiException : Exception
{
	public EnumApiError ErrorCode { get; }

	public ApiException(EnumApiError errorCode, string message)
		: base(message)
	{
		ErrorCode = errorCode;
	}

	public ApiException(EnumApiError errorCode, string message, Exception innerException)
		: base(message, innerException)
	{
		ErrorCode = errorCode;
	}
}
