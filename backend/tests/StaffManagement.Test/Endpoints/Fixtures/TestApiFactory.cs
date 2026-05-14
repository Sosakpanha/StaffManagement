using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

namespace StaffManagement.Test.Endpoints;

/// <summary>
/// WebApplicationFactory that boots the API for an integration test.
///
/// Configuration (connection string, CORS origins) is provided via
/// process-wide environment variables set by <see cref="TestEnvironment"/>'s
/// OneTimeSetUp. The default IConfiguration env-var provider reads them
/// during WebApplication.CreateBuilder, which guarantees they're visible
/// to Program.cs's startup code.
/// </summary>
public class TestApiFactory : WebApplicationFactory<Program>
{
	protected override void ConfigureWebHost(IWebHostBuilder builder)
	{
		builder.UseEnvironment("Development");
	}
}
