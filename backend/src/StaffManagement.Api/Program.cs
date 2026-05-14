using Dapper;
using Microsoft.AspNetCore.HttpLogging;
using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using NLog;
using NLog.Web;
using QuestPDF.Infrastructure;
using StaffManagement.Api.Data;
using StaffManagement.Api.Data.Interfaces;
using StaffManagement.Api.Enums;
using StaffManagement.Api.Exports;
using StaffManagement.Api.Filters;
using StaffManagement.Api.Repositories;
using StaffManagement.Api.Repositories.Interfaces;
using StaffManagement.Api.Services;
using StaffManagement.Api.Services.Interfaces;

// QuestPDF Community license must be set before any PDF is generated.
QuestPDF.Settings.License = LicenseType.Community;

// Dapper 2.1.x doesn't ship DateOnly handlers; register ours so the
// repositories can pass DateOnly straight through to SQL `date` columns.
SqlMapper.AddTypeHandler(new DateOnlyTypeHandler());
SqlMapper.AddTypeHandler(new NullableDateOnlyTypeHandler());

// Bootstrap NLog before WebApplication.CreateBuilder so startup errors are captured.
var logger = LogManager.Setup()
	.LoadConfigurationFromFile("nlog.config", optional: false)
	.GetCurrentClassLogger();

try
{
	logger.Info("Starting StaffManagement.Api");

	var builder = WebApplication.CreateBuilder(args);

	builder.Logging.ClearProviders();
	builder.Host.UseNLog();

	builder.Services
		.AddControllers(options =>
		{
			options.Filters.Add<ExceptionFilter>();
		})
		.AddNewtonsoftJson(options =>
		{
			options.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
			options.SerializerSettings.NullValueHandling = NullValueHandling.Ignore;
		})
		.ConfigureApiBehaviorOptions(options =>
		{
			// Route model-validation failures through the same {code, message}
			// envelope as ApiException so clients have one shape to handle.
			options.InvalidModelStateResponseFactory = context =>
			{
				var errors = context.ModelState
					.Where(kvp => kvp.Value is { Errors.Count: > 0 })
					.SelectMany(kvp => kvp.Value!.Errors.Select(e =>
						string.IsNullOrEmpty(e.ErrorMessage)
							? $"{kvp.Key} is invalid."
							: $"{kvp.Key}: {e.ErrorMessage}"));

				var message = string.Join(" ", errors);

				return new ObjectResult(new
				{
					code = (int)EnumApiError.ValidationFailed,
					message
				})
				{
					StatusCode = StatusCodes.Status400BadRequest
				};
			};
		});

	builder.Services.AddSingleton<ExceptionFilter>();

	builder.Services.AddSingleton<IStaffRepository, StaffRepository>();
	builder.Services.AddSingleton<IStaffService, StaffService>();
	builder.Services.AddSingleton<StaffExcelExporter>();
	builder.Services.AddSingleton<StaffPdfExporter>();

	builder.Services.AddEndpointsApiExplorer();
	builder.Services.AddSwaggerGen(options =>
	{
		options.SwaggerDoc("v1", new OpenApiInfo
		{
			Title = "StaffManagement.Api",
			Version = "v1"
		});
	});

	var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
		?? throw new InvalidOperationException(
			"Connection string 'DefaultConnection' is missing. " +
			"Set ConnectionStrings__DefaultConnection in the environment or appsettings.json.");

	builder.Services.AddSingleton<IDbConnectionFactory>(new SqlConnectionFactory(connectionString));

	builder.Services.AddHealthChecks();

	builder.Services.AddHttpLogging(options =>
	{
		options.LoggingFields = HttpLoggingFields.RequestMethod
		                     | HttpLoggingFields.RequestPath
		                     | HttpLoggingFields.ResponseStatusCode
		                     | HttpLoggingFields.Duration;
		options.CombineLogs = true;
	});

	builder.Services.AddCors(options =>
	{
		var allowedOrigins = builder.Configuration
			.GetSection("Cors:AllowedOrigins")
			.Get<string[]>() ?? Array.Empty<string>();

		options.AddDefaultPolicy(policy => policy
			.WithOrigins(allowedOrigins)
			.AllowAnyHeader()
			.AllowAnyMethod());
	});

	var app = builder.Build();

	if (app.Environment.IsDevelopment())
	{
		app.UseSwagger();
		app.UseSwaggerUI();
	}

	app.UseHttpsRedirection();
	app.UseCors();
	app.UseHttpLogging();

	app.MapControllers();
	app.MapHealthChecks("/health");

	app.Run();
}
catch (Exception ex)
{
	logger.Fatal(ex, "Application startup failed");
	throw;
}
finally
{
	LogManager.Shutdown();
}

// Exposed for WebApplicationFactory<Program> in the integration tests.
public partial class Program;
