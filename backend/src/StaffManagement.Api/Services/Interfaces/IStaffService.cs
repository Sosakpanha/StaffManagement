using StaffManagement.Api.Models.Requests.Staff;
using StaffManagement.Api.Models.Responses.Staff;

namespace StaffManagement.Api.Services.Interfaces;

public interface IStaffService
{
	Task<StaffResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

	Task<StaffResponse> CreateAsync(StaffCreateRequest request, CancellationToken cancellationToken = default);

	Task<StaffResponse> UpdateAsync(Guid id, StaffUpdateRequest request, CancellationToken cancellationToken = default);

	Task<StaffResponse> DeleteAsync(Guid id, CancellationToken cancellationToken = default);

	Task<PagedResponse<StaffResponse>> SearchAsync(StaffSearchRequest request, CancellationToken cancellationToken = default);
}
