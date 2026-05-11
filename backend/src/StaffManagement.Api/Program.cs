using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using NLog;
using NLog.Web;
using QuestPDF.Infrastructure;
using StaffManagement.Api.Data;
using StaffManagement.Api.Data.Interfaces;
using StaffManagement.Api.Filters;

// QuestPDF Community license must be set before any PDF is generated.
QuestPDF.Settings.License = LicenseType.Community;

// Bootstrap NLog before WebApplication.CreateBuilder so startup errors are captured.
var logger = LogManager.Setup()
	.LoadConfigurationFromFile("nlog.config", optional: false)
	.GetCurrentClassLogger();

try
{
	logger.Info("Starting StaffManagement.Api");

	var builder = WebApplication.CreateBuilder(args);

	// Replace the default logging with NLog.
	builder.Logging.ClearProviders();
	builder.Host.UseNLog();

	// Controllers + Newtonsoft.Json with camelCase property names.
	builder.Services
		.AddControllers(options =>
		{
			options.Filters.Add<ExceptionFilter>();
		})
		.AddNewtonsoftJson(options =>
		{
			options.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
			options.SerializerSettings.NullValueHandling = NullValueHandling.Ignore;
		});

	builder.Services.AddSingleton<ExceptionFilter>();

	// Swagger with JWT bearer scheme.
	builder.Services.AddEndpointsApiExplorer();
	builder.Services.AddSwaggerGen(options =>
	{
		options.SwaggerDoc("v1", new OpenApiInfo
		{
			Title = "StaffManagement.Api",
			Version = "v1"
		});

		options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
		{
			Description = "JWT bearer token. Format: 'Bearer {token}'.",
			Name = "Authorization",
			In = ParameterLocation.Header,
			Type = SecuritySchemeType.Http,
			Scheme = "bearer",
			BearerFormat = "JWT"
		});

		options.AddSecurityRequirement(new OpenApiSecurityRequirement
		{
			{
				new OpenApiSecurityScheme
				{
					Reference = new OpenApiReference
					{
						Type = ReferenceType.SecurityScheme,
						Id = "Bearer"
					}
				},
				Array.Empty<string>()
			}
		});
	});

	// Data access.
	var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
		?? throw new InvalidOperationException(
			"Connection string 'DefaultConnection' is missing. " +
			"Set ConnectionStrings__DefaultConnection in the environment or appsettings.json.");

	builder.Services.AddSingleton<IDbConnectionFactory>(new SqlConnectionFactory(connectionString));

	// Health checks.
	builder.Services.AddHealthChecks();

	// CORS (allowed origins are configurable per environment).
	builder.Services.AddCors(options =>
	{
		var allowedOrigins = builder.Configuration
			.GetSection("Cors:AllowedOrigins")
			.Get<string[]>() ?? Array.Empty<string>();

		options.AddDefaultPolicy(policy => policy
			.WithOrigins(allowedOrigins)
			.AllowAnyHeader()
			.AllowAnyMethod()
			.AllowCredentials());
	});

	// JWT bearer authentication (token issuance lives in the auth feature).
	var jwtSection = builder.Configuration.GetSection("Jwt");
	var signingKey = jwtSection["SigningKey"]
		?? throw new InvalidOperationException(
			"Jwt:SigningKey is missing. Set Jwt__SigningKey in the environment.");

	builder.Services
		.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
		.AddJwtBearer(options =>
		{
			options.TokenValidationParameters = new TokenValidationParameters
			{
				ValidateIssuer = !string.IsNullOrEmpty(jwtSection["Issuer"]),
				ValidIssuer = jwtSection["Issuer"],
				ValidateAudience = !string.IsNullOrEmpty(jwtSection["Audience"]),
				ValidAudience = jwtSection["Audience"],
				ValidateIssuerSigningKey = true,
				IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey)),
				ValidateLifetime = true,
				ClockSkew = TimeSpan.FromSeconds(30)
			};
		});

	builder.Services.AddAuthorization();

	var app = builder.Build();

	if (app.Environment.IsDevelopment())
	{
		app.UseSwagger();
		app.UseSwaggerUI();
	}

	app.UseHttpsRedirection();
	app.UseCors();
	app.UseAuthentication();
	app.UseAuthorization();

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
