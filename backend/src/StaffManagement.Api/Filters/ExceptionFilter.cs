using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using StaffManagement.Api.Enums;
using StaffManagement.Api.Exceptions;

namespace StaffManagement.Api.Filters;

/// <summary>
/// Global exception filter. Catches <see cref="ApiException"/> and maps
/// the error code to an HTTP status. Anything else becomes a 500 with
/// the generic UnknownError code (we never leak the raw exception text
/// to clients, only to the log).
/// </summary>
public sealed class ExceptionFilter : IExceptionFilter
{
	private readonly ILogger<ExceptionFilter> _logger;

	public ExceptionFilter(ILogger<ExceptionFilter> logger)
	{
		_logger = logger;
	}

	public void OnException(ExceptionContext context)
	{
		var exception = context.Exception;
		var (status, code, message) = MapException(exception);

		// Expected business errors (ApiException) are Warnings; only truly
		// unexpected things are logged at Error.
		if (exception is ApiException)
		{
			_logger.LogWarning(
				"Handled {Code} ({Status}) in {Method} {Path}: {Message}",
				code, status,
				context.HttpContext.Request.Method,
				context.HttpContext.Request.Path,
				exception.Message);
		}
		else
		{
			_logger.LogError(exception,
				"Unhandled exception in {Method} {Path}",
				context.HttpContext.Request.Method,
				context.HttpContext.Request.Path);
		}

		context.Result = new ObjectResult(new
		{
			code = (int)code,
			message
		})
		{
			StatusCode = status
		};

		context.ExceptionHandled = true;
	}

	private static (int Status, EnumApiError Code, string Message) MapException(Exception exception)
	{
		if (exception is ApiException api)
		{
			return MapApiException(api);
		}

		return (
			StatusCodes.Status500InternalServerError,
			EnumApiError.UnknownError,
			"An unexpected error occurred. Please contact support if the problem persists.");
	}

	private static (int Status, EnumApiError Code, string Message) MapApiException(ApiException api)
	{
		var status = api.ErrorCode switch
		{
			EnumApiError.DuplicateStaffId => StatusCodes.Status409Conflict,
			EnumApiError.StaffNotFound    => StatusCodes.Status404NotFound,
			EnumApiError.ValidationFailed => StatusCodes.Status400BadRequest,
			_                             => StatusCodes.Status500InternalServerError
		};

		return (status, api.ErrorCode, api.Message);
	}
}
