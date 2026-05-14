using StaffManagement.Api.Entities;
using StaffManagement.Api.Enums;
using StaffManagement.Api.Exceptions;
using StaffManagement.Api.Models.Requests.Staff;
using StaffManagement.Api.Models.Responses.Staff;
using StaffManagement.Api.Repositories.Interfaces;
using StaffManagement.Api.Services.Interfaces;

namespace StaffManagement.Api.Services;

public sealed class StaffService : IStaffService
{
	private readonly IStaffRepository _staffRepository;

	public StaffService(IStaffRepository staffRepository)
	{
		_staffRepository = staffRepository;
	}

	public async Task<StaffResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
	{
		var entity = await _staffRepository.GetByIdAsync(id, cancellationToken);

		if (entity is null)
		{
			throw new ApiException(EnumApiError.StaffNotFound, "Staff not found.");
		}

		return MapToResponse(entity);
	}

	public async Task<StaffResponse> CreateAsync(StaffCreateRequest request, CancellationToken cancellationToken = default)
	{
		var entity = await _staffRepository.CreateAsync(request, cancellationToken);
		return MapToResponse(entity);
	}

	public async Task<StaffResponse> UpdateAsync(Guid id, StaffUpdateRequest request, CancellationToken cancellationToken = default)
	{
		var entity = await _staffRepository.UpdateAsync(id, request, cancellationToken);
		return MapToResponse(entity);
	}

	public async Task<StaffResponse> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
	{
		var entity = await _staffRepository.DeleteAsync(id, cancellationToken);
		return MapToResponse(entity);
	}

	public async Task<PagedResponse<StaffResponse>> SearchAsync(StaffSearchRequest request, CancellationToken cancellationToken = default)
	{
		var (items, totalCount) = await _staffRepository.SearchAsync(request, cancellationToken);

		return new PagedResponse<StaffResponse>
		{
			Items = items.Select(MapToResponse).ToList(),
			TotalCount = totalCount,
			Page = request.Page,
			PageSize = request.PageSize
		};
	}

	private static StaffResponse MapToResponse(Staff entity) => new()
	{
		Id        = entity.Id,
		StaffId   = entity.StaffId,
		FullName  = entity.FullName,
		Birthday  = entity.Birthday,
		Gender    = entity.Gender,
		CreatedAt = entity.CreatedAt,
		UpdatedAt = entity.UpdatedAt
	};
}
