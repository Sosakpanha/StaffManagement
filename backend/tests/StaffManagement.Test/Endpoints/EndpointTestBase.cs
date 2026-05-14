namespace StaffManagement.Test.Endpoints;

/// <summary>
/// Shared base for endpoint test classes. Each test gets a fresh DB reset
/// and a TestApiFactory wired to the shared Testcontainers SQL Server.
/// </summary>
public abstract class EndpointTestBase
{
	protected TestApiFactory Factory { get; private set; } = null!;
	protected HttpClient Client { get; private set; } = null!;

	[SetUp]
	public async Task EndpointTestBase_SetUpAsync()
	{
		await TestEnvironment.ResetAsync();
		Factory = new TestApiFactory();
		Client = Factory.CreateClient();
	}

	[TearDown]
	public void EndpointTestBase_TearDown()
	{
		Client.Dispose();
		Factory.Dispose();
	}
}
