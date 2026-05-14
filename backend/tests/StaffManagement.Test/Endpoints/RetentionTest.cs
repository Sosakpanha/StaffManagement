using System.Net.Http.Json;
using Dapper;
using FluentAssertions;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.DependencyInjection;
using StaffManagement.Api.Repositories.Interfaces;

namespace StaffManagement.Test.Endpoints;

[TestFixture]
public class RetentionTest : EndpointTestBase
{
	[Test]
	public async Task PurgeSoftDeleted_removes_rows_older_than_retention_window()
	{
		var created = await CreateAsync("RET00001", "Retention Window");
		(await Client.DeleteAsync($"/api/staff/{created.Id}")).EnsureSuccessStatusCode();

		// The row is soft-deleted with DeletedAt = SYSUTCDATETIME(). Backdate
		// it so a small @RetentionDays still considers it ancient.
		await using (var conn = new SqlConnection(TestEnvironment.ConnectionString))
		{
			await conn.OpenAsync();
			await conn.ExecuteAsync(
				"UPDATE dbo.Staff SET DeletedAt = @When WHERE Id = @Id",
				new { When = new DateTime(1900, 1, 1), Id = created.Id });
		}

		using var scope = Factory.Services.CreateScope();
		var repository = scope.ServiceProvider.GetRequiredService<IStaffRepository>();

		var purged = await repository.PurgeSoftDeletedAsync(retentionDays: 0);
		purged.Should().BeGreaterThanOrEqualTo(1);

		await using (var conn = new SqlConnection(TestEnvironment.ConnectionString))
		{
			await conn.OpenAsync();
			var remaining = await conn.ExecuteScalarAsync<int>(
				"SELECT COUNT(*) FROM dbo.Staff WHERE Id = @Id",
				new { Id = created.Id });
			remaining.Should().Be(0);
		}
	}

	[Test]
	public async Task PurgeSoftDeleted_keeps_rows_inside_the_retention_window()
	{
		var created = await CreateAsync("RET00002", "Recent Soft Delete");
		(await Client.DeleteAsync($"/api/staff/{created.Id}")).EnsureSuccessStatusCode();

		using var scope = Factory.Services.CreateScope();
		var repository = scope.ServiceProvider.GetRequiredService<IStaffRepository>();

		// 90 days window; the row was deleted just now.
		var purged = await repository.PurgeSoftDeletedAsync(retentionDays: 90);
		purged.Should().Be(0);

		await using var conn = new SqlConnection(TestEnvironment.ConnectionString);
		await conn.OpenAsync();
		var stillSoftDeleted = await conn.ExecuteScalarAsync<int>(
			"SELECT COUNT(*) FROM dbo.Staff WHERE Id = @Id AND IsDeleted = 1",
			new { Id = created.Id });
		stillSoftDeleted.Should().Be(1);
	}

	private async Task<StaffPayload> CreateAsync(string staffId, string fullName)
	{
		var response = await Client.PostAsJsonAsync("/api/staff", new
		{
			staffId,
			fullName,
			birthday = "1990-05-15",
			gender   = 1
		});
		response.EnsureSuccessStatusCode();
		return (await response.Content.ReadFromJsonAsync<StaffPayload>())!;
	}

	private sealed record StaffPayload(
		Guid Id, string StaffId, string FullName, DateOnly Birthday, int Gender, DateTime CreatedAt, DateTime UpdatedAt);
}
