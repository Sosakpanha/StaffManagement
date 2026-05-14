using System.Net;
using System.Net.Http.Json;
using FluentAssertions;

namespace StaffManagement.Test.Endpoints;

[TestFixture]
public class StaffSearchEndpointsTest : EndpointTestBase
{
	[SetUp]
	public async Task Seed()
	{
		await CreateAsync("SM00001", "Alice Cooper",  "1990-05-15", 1);
		await CreateAsync("SM00002", "Bob Builder",   "1985-03-20", 1);
		await CreateAsync("SM00003", "Carol Smith",   "1995-07-10", 2);
		await CreateAsync("SM00004", "Diana Prince",  "1988-11-30", 2);
	}

	[Test]
	public async Task Search_with_no_filters_should_return_all_records()
	{
		var page = await GetAsync("/api/staff");

		page.TotalCount.Should().Be(4);
		page.Items.Should().HaveCount(4);
	}

	[Test]
	public async Task Search_by_gender_should_narrow_results()
	{
		var page = await GetAsync("/api/staff?gender=2");

		page.TotalCount.Should().Be(2);
		page.Items.Should().OnlyContain(i => i.Gender == 2);
	}

	[Test]
	public async Task Search_by_birthday_range_should_narrow_results()
	{
		var page = await GetAsync("/api/staff?birthdayFrom=1985-01-01&birthdayTo=1989-12-31");

		page.TotalCount.Should().Be(2); // Bob (1985) and Diana (1988)
		page.Items.Select(i => i.StaffId).Should().BeEquivalentTo(new[] { "SM00002", "SM00004" });
	}

	[Test]
	public async Task Search_by_staffId_substring_should_narrow_results()
	{
		var page = await GetAsync("/api/staff?staffId=003");

		page.TotalCount.Should().Be(1);
		page.Items[0].StaffId.Should().Be("SM00003");
	}

	[Test]
	public async Task Search_should_paginate()
	{
		var first = await GetAsync("/api/staff?page=1&pageSize=2&sortBy=staffId");
		first.TotalCount.Should().Be(4);
		first.Items.Should().HaveCount(2);
		first.TotalPages.Should().Be(2);

		var second = await GetAsync("/api/staff?page=2&pageSize=2&sortBy=staffId");
		second.Items.Should().HaveCount(2);

		first.Items.Select(i => i.Id).Should().NotIntersectWith(second.Items.Select(i => i.Id));
	}

	private async Task CreateAsync(string staffId, string fullName, string birthday, int gender)
	{
		var response = await Client.PostAsJsonAsync("/api/staff", new { staffId, fullName, birthday, gender });
		response.EnsureSuccessStatusCode();
	}

	private async Task<PagePayload> GetAsync(string url)
	{
		var response = await Client.GetAsync(url);
		response.StatusCode.Should().Be(HttpStatusCode.OK);
		return (await response.Content.ReadFromJsonAsync<PagePayload>())!;
	}

	private sealed record PagePayload(IReadOnlyList<StaffPayload> Items, int TotalCount, int Page, int PageSize, int TotalPages);
	private sealed record StaffPayload(Guid Id, string StaffId, string FullName, DateOnly Birthday, int Gender);
}
