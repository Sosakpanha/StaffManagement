using System.Net;
using System.Net.Http.Json;
using FluentAssertions;

namespace StaffManagement.Test.Endpoints;

[TestFixture]
public class StaffCrudEndpointsTest : EndpointTestBase
{
	[Test]
	public async Task Create_should_return_200_with_created_resource()
	{
		var response = await Client.PostAsJsonAsync("/api/staff", new
		{
			staffId  = "SM00001",
			fullName = "Alice Cooper",
			birthday = "1990-05-15",
			gender   = 1
		});

		response.StatusCode.Should().Be(HttpStatusCode.OK);
		var staff = await response.Content.ReadFromJsonAsync<StaffPayload>();
		staff!.Id.Should().NotBeEmpty();
		staff.StaffId.Should().Be("SM00001");
		staff.FullName.Should().Be("Alice Cooper");
		staff.Gender.Should().Be(1);
	}

	[Test]
	public async Task Create_should_return_409_on_duplicate_staffId()
	{
		await CreateAsync("SM00001", "Alice");

		var response = await Client.PostAsJsonAsync("/api/staff", new
		{
			staffId  = "SM00001",
			fullName = "Different person",
			birthday = "1990-01-01",
			gender   = 2
		});

		response.StatusCode.Should().Be(HttpStatusCode.Conflict);
		var error = await response.Content.ReadFromJsonAsync<ErrorPayload>();
		error!.Code.Should().Be(50001); // DuplicateStaffId
	}

	[Test]
	public async Task Create_should_return_400_when_gender_out_of_range()
	{
		var response = await Client.PostAsJsonAsync("/api/staff", new
		{
			staffId  = "SM99999",
			fullName = "Bad gender",
			birthday = "1990-01-01",
			gender   = 9
		});

		response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
		var error = await response.Content.ReadFromJsonAsync<ErrorPayload>();
		error!.Code.Should().Be(40000);
	}

	[Test]
	public async Task GetById_should_return_404_when_missing()
	{
		var response = await Client.GetAsync($"/api/staff/{Guid.Empty}");

		response.StatusCode.Should().Be(HttpStatusCode.NotFound);
		var error = await response.Content.ReadFromJsonAsync<ErrorPayload>();
		error!.Code.Should().Be(50404);
	}

	[Test]
	public async Task Update_should_persist_changes_and_bump_UpdatedAt()
	{
		var created = await CreateAsync("SM00001", "Alice");

		var updateResponse = await Client.PutAsJsonAsync($"/api/staff/{created.Id}", new
		{
			staffId  = "SM00001",
			fullName = "Alice Updated",
			birthday = "1990-05-15",
			gender   = 1
		});

		updateResponse.StatusCode.Should().Be(HttpStatusCode.OK);
		var updated = await updateResponse.Content.ReadFromJsonAsync<StaffPayload>();
		updated!.FullName.Should().Be("Alice Updated");
		updated.UpdatedAt.Should().BeOnOrAfter(created.UpdatedAt);
	}

	[Test]
	public async Task Update_should_return_404_when_missing()
	{
		var response = await Client.PutAsJsonAsync($"/api/staff/{Guid.Empty}", new
		{
			staffId  = "SM00099",
			fullName = "Ghost",
			birthday = "1990-01-01",
			gender   = 1
		});

		response.StatusCode.Should().Be(HttpStatusCode.NotFound);
	}

	[Test]
	public async Task Delete_should_return_204_then_404_on_second_call()
	{
		var created = await CreateAsync("SM00001", "Alice");

		var first = await Client.DeleteAsync($"/api/staff/{created.Id}");
		first.StatusCode.Should().Be(HttpStatusCode.NoContent);

		var second = await Client.DeleteAsync($"/api/staff/{created.Id}");
		second.StatusCode.Should().Be(HttpStatusCode.NotFound);
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

	private sealed record ErrorPayload(int Code, string Message);
}
