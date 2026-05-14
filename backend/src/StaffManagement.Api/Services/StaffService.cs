using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Primitives;
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
	private static readonly TimeSpan SearchCacheTtl = TimeSpan.FromSeconds(60);
	private const string SearchCacheKeyPrefix = "staff:search:";

	private readonly IStaffRepository _staffRepository;
	private readonly IMemoryCache _cache;

	// One CancellationTokenSource scopes every currently-cached search.
	// Any write swaps in a fresh CTS and cancels the old one, which evicts
	// every entry tagged with the previous token in one shot.
	private CancellationTokenSource _searchCacheReset = new();

	public StaffService(IStaffRepository staffRepository, IMemoryCache cache)
	{
		_staffRepository = staffRepository;
		_cache = cache;
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
		InvalidateSearchCache();
		return MapToResponse(entity);
	}

	public async Task<StaffResponse> UpdateAsync(Guid id, StaffUpdateRequest request, CancellationToken cancellationToken = default)
	{
		var entity = await _staffRepository.UpdateAsync(id, request, cancellationToken);
		InvalidateSearchCache();
		return MapToResponse(entity);
	}

	public async Task<StaffResponse> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
	{
		var entity = await _staffRepository.DeleteAsync(id, cancellationToken);
		InvalidateSearchCache();
		return MapToResponse(entity);
	}

	public async Task<PagedResponse<StaffResponse>> SearchAsync(StaffSearchRequest request, CancellationToken cancellationToken = default)
	{
		var cacheKey = SearchCacheKeyPrefix + BuildCacheKey(request);

		return (await _cache.GetOrCreateAsync(cacheKey, async entry =>
		{
			entry.AbsoluteExpirationRelativeToNow = SearchCacheTtl;
			entry.AddExpirationToken(new CancellationChangeToken(_searchCacheReset.Token));

			var (items, totalCount) = await _staffRepository.SearchAsync(request, cancellationToken);

			return new PagedResponse<StaffResponse>
			{
				Items = items.Select(MapToResponse).ToList(),
				TotalCount = totalCount,
				Page = request.Page,
				PageSize = request.PageSize
			};
		}))!;
	}

	private void InvalidateSearchCache()
	{
		var old = Interlocked.Exchange(ref _searchCacheReset, new CancellationTokenSource());
		old.Cancel();
		old.Dispose();
	}

	private static string BuildCacheKey(StaffSearchRequest r) =>
		string.Join('|',
			r.StaffId ?? "",
			r.Gender?.ToString() ?? "",
			r.BirthdayFrom?.ToString("yyyy-MM-dd") ?? "",
			r.BirthdayTo?.ToString("yyyy-MM-dd") ?? "",
			r.FullName ?? "",
			r.Page,
			r.PageSize,
			r.SortBy,
			r.SortDir);

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
