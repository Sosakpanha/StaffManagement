using Microsoft.Data.SqlClient;
using Microsoft.SqlServer.Dac;
using Respawn;
using Respawn.Graph;
using Testcontainers.MsSql;

// Namespace deliberately matches the endpoint tests so NUnit's
// [SetUpFixture] applies to them. NUnit only runs a [SetUpFixture]
// for tests in its own namespace and below.
namespace StaffManagement.Test.Endpoints;

/// <summary>
/// Spins up one SQL Server container for the whole test run, deploys the
/// project's DACPAC into it, and exposes the resulting connection string
/// (and a configured Respawner) to every endpoint test class.
/// </summary>
[SetUpFixture]
public class TestEnvironment
{
	private const string DatabaseName = "StaffManagement";

	private static MsSqlContainer? _container;
	private static Respawner? _respawner;

	public static string ConnectionString { get; private set; } = string.Empty;

	[OneTimeSetUp]
	public async Task SetUpAsync()
	{
		_container = new MsSqlBuilder("mcr.microsoft.com/mssql/server:2022-latest").Build();

		await _container.StartAsync();

		var serverConnection = _container.GetConnectionString();
		var dbBuilder = new SqlConnectionStringBuilder(serverConnection)
		{
			InitialCatalog = DatabaseName
		};
		ConnectionString = dbBuilder.ConnectionString;

		var dacpacPath = LocateDacpac();
		var dacServices = new DacServices(serverConnection);
		dacServices.Message += (_, e) => TestContext.Out.WriteLine(e.Message.Message);

		using var package = DacPackage.Load(dacpacPath);
		dacServices.Deploy(
			package,
			DatabaseName,
			upgradeExisting: false,
			options: new DacDeployOptions
			{
				CreateNewDatabase = true,
				BlockOnPossibleDataLoss = false
			});

		// Reset all tables between tests so each one starts from an empty DB.
		using var setupConnection = new SqlConnection(ConnectionString);
		await setupConnection.OpenAsync();
		_respawner = await Respawner.CreateAsync(setupConnection, new RespawnerOptions
		{
			DbAdapter = DbAdapter.SqlServer
		});

		// Process-wide env vars so the API (booted by WebApplicationFactory)
		// reads them through its default IConfiguration providers.
		Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT",            "Development");
		Environment.SetEnvironmentVariable("ConnectionStrings__DefaultConnection", ConnectionString);
		Environment.SetEnvironmentVariable("Cors__AllowedOrigins__0",           "http://localhost:5173");
	}

	[OneTimeTearDown]
	public async Task TearDownAsync()
	{
		if (_container is not null)
		{
			await _container.DisposeAsync();
		}
	}

	public static async Task ResetAsync()
	{
		if (_respawner is null)
		{
			throw new InvalidOperationException("Test environment has not been initialised.");
		}

		await using var connection = new SqlConnection(ConnectionString);
		await connection.OpenAsync();
		await _respawner.ResetAsync(connection);
	}

	private static string LocateDacpac()
	{
		var dir = new DirectoryInfo(AppContext.BaseDirectory);
		while (dir is not null && !File.Exists(Path.Combine(dir.FullName, "StaffManagement.sln")))
		{
			dir = dir.Parent;
		}

		if (dir is null)
		{
			throw new InvalidOperationException("Could not locate the solution root from " + AppContext.BaseDirectory);
		}

		// Match whichever configuration produced this test assembly.
		var configuration = AppContext.BaseDirectory.Contains("Release") ? "Release" : "Debug";
		var dacpac = Path.Combine(
			dir.FullName,
			"database", "StaffManagement.Database", "bin", configuration,
			"StaffManagement.Database.dacpac");

		if (!File.Exists(dacpac))
		{
			throw new FileNotFoundException(
				$"DACPAC not found at {dacpac}. Run 'dotnet build StaffManagement.sln' first.");
		}

		return dacpac;
	}
}
