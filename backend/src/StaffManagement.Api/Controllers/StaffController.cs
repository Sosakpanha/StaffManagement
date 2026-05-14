using Microsoft.AspNetCore.Mvc;
using StaffManagement.Api.Models.Requests.Staff;
using StaffManagement.Api.Models.Responses.Staff;
using StaffManagement.Api.Services.Interfaces;

namespace StaffManagement.Api.Controllers;

[ApiController]
[Route("api/staff")]
public class StaffController : ControllerBase
{
	private readonly IStaffService _staffService;

	public StaffController(IStaffService staffService)
	{
		_staffService = staffService;
	}

	[HttpGet]
	public async Task<PagedResponse<StaffResponse>> Search(
		[FromQuery] StaffSearchRequest request,
		CancellationToken cancellationToken)
	{
		var result = await _staffService.SearchAsync(request, cancellationToken);
		return result;
	}

	[HttpGet("{id:guid}")]
	public async Task<StaffResponse> GetById(
		Guid id,
		CancellationToken cancellationToken)
	{
		var staff = await _staffService.GetByIdAsync(id, cancellationToken);
		return staff;
	}

	[HttpPost]
	public async Task<StaffResponse> Create(
		[FromBody] StaffCreateRequest request,
		CancellationToken cancellationToken)
	{
		var staff = await _staffService.CreateAsync(request, cancellationToken);
		return staff;
	}

	[HttpPut("{id:guid}")]
	public async Task<StaffResponse> Update(
		Guid id,
		[FromBody] StaffUpdateRequest request,
		CancellationToken cancellationToken)
	{
		var staff = await _staffService.UpdateAsync(id, request, cancellationToken);
		return staff;
	}

	[HttpDelete("{id:guid}")]
	public async Task<StaffResponse> Delete(
		Guid id,
		CancellationToken cancellationToken)
	{
		return await _staffService.DeleteAsync(id, cancellationToken);
	}
}
