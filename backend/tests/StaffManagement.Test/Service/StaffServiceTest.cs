using FluentAssertions;
using NSubstitute;
using StaffManagement.Api.Entities;
using StaffManagement.Api.Enums;
using StaffManagement.Api.Exceptions;
using StaffManagement.Api.Models.Requests.Staff;
using StaffManagement.Api.Repositories.Interfaces;
using StaffManagement.Api.Services;

namespace StaffManagement.Test.Service;

[TestFixture]
public class StaffServiceTest
{
	private IStaffRepository _repository = null!;
	private StaffService _service = null!;

	[SetUp]
	public void SetUp()
	{
		_repository = Substitute.For<IStaffRepository>();
		_service = new StaffService(_repository);
	}

	[Test]
	public async Task GetByIdAsync_should_throw_StaffNotFound_when_repository_returns_null()
	{
		_repository.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>()).Returns((Staff?)null);

		Func<Task> act = () => _service.GetByIdAsync(Guid.NewGuid());

		var ex = (await act.Should().ThrowAsync<ApiException>()).Which;
		ex.ErrorCode.Should().Be(EnumApiError.StaffNotFound);
	}

	[Test]
	public async Task GetByIdAsync_should_return_mapped_response_when_found()
	{
		var entity = SampleStaff();
		_repository.GetByIdAsync(entity.Id, Arg.Any<CancellationToken>()).Returns(entity);

		var response = await _service.GetByIdAsync(entity.Id);

		response.Id.Should().Be(entity.Id);
		response.StaffId.Should().Be(entity.StaffId);
		response.FullName.Should().Be(entity.FullName);
		response.Birthday.Should().Be(entity.Birthday);
		response.Gender.Should().Be(entity.Gender);
	}

	[Test]
	public async Task CreateAsync_should_delegate_to_repository_and_map_result()
	{
		var entity = SampleStaff();
		var request = new StaffCreateRequest
		{
			StaffId = entity.StaffId,
			FullName = entity.FullName,
			Birthday = entity.Birthday,
			Gender = entity.Gender
		};
		_repository.CreateAsync(request, Arg.Any<CancellationToken>()).Returns(entity);

		var response = await _service.CreateAsync(request);

		response.Id.Should().Be(entity.Id);
		response.StaffId.Should().Be(entity.StaffId);
	}

	[Test]
	public async Task SearchAsync_should_pass_paging_metadata_through()
	{
		var entity = SampleStaff();
		_repository
			.SearchAsync(Arg.Any<StaffSearchRequest>(), Arg.Any<CancellationToken>())
			.Returns((new[] { entity } as IReadOnlyList<Staff>, 42));

		var request = new StaffSearchRequest { Page = 3, PageSize = 5 };
		var response = await _service.SearchAsync(request);

		response.Items.Should().ContainSingle().Which.StaffId.Should().Be(entity.StaffId);
		response.TotalCount.Should().Be(42);
		response.Page.Should().Be(3);
		response.PageSize.Should().Be(5);
		response.TotalPages.Should().Be(9); // ceil(42 / 5)
	}

	[Test]
	public async Task DeleteAsync_should_pass_id_through_to_repository()
	{
		var id = Guid.NewGuid();

		await _service.DeleteAsync(id);

		await _repository.Received(1).DeleteAsync(id, Arg.Any<CancellationToken>());
	}

	private static Staff SampleStaff() => new()
	{
		Id = Guid.NewGuid(),
		StaffId = "SM00001",
		FullName = "Alice Cooper",
		Birthday = new DateOnly(1990, 5, 15),
		Gender = 1,
		CreatedAt = new DateTime(2026, 1, 1, 12, 0, 0, DateTimeKind.Utc),
		UpdatedAt = new DateTime(2026, 1, 1, 12, 0, 0, DateTimeKind.Utc)
	};
}
