using StaffManagement.Api.Entities;
using StaffManagement.Api.Models.Requests.Staff;

namespace StaffManagement.Api.Repositories.Interfaces;

public interface IStaffRepository
{
	Task<Staff?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

	Task<Staff> CreateAsync(StaffCreateRequest request, CancellationToken cancellationToken = default);

	Task<Staff> UpdateAsync(Guid id, StaffUpdateRequest request, CancellationToken cancellationToken = default);

	Task<Staff> DeleteAsync(Guid id, CancellationToken cancellationToken = default);

	Task<(IReadOnlyList<Staff> Items, int TotalCount)> SearchAsync(StaffSearchRequest request, CancellationToken cancellationToken = default);

	Task<int> PurgeSoftDeletedAsync(int retentionDays, CancellationToken cancellationToken = default);
}
