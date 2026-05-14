using Microsoft.Extensions.Options;
using StaffManagement.Api.Repositories.Interfaces;

namespace StaffManagement.Api.Jobs;

public sealed class PurgeDeletedStaffOptions
{
	public int RetentionDays { get; set; } = 90;
}

/// <summary>
/// Hard-deletes Staff rows whose IsDeleted = 1 and DeletedAt is older
/// than RetentionDays. Scheduled by JobRunner from the SchedulerSettings
/// entry; the per-run work itself lives in the PurgeSoftDeletedStaff SP.
/// </summary>
public sealed class PurgeDeletedStaffJob : IJob
{
	private readonly IStaffRepository _staff;
	private readonly PurgeDeletedStaffOptions _options;
	private readonly ILogger<PurgeDeletedStaffJob> _logger;

	public PurgeDeletedStaffJob(
		IStaffRepository staff,
		IOptions<PurgeDeletedStaffOptions> options,
		ILogger<PurgeDeletedStaffJob> logger)
	{
		_staff = staff;
		_options = options.Value;
		_logger = logger;
	}

	public async Task ExecuteAsync(CancellationToken cancellationToken = default)
	{
		var purged = await _staff.PurgeSoftDeletedAsync(_options.RetentionDays, cancellationToken);
		_logger.LogInformation(
			"PurgeDeletedStaffJob purged {PurgedCount} row(s) older than {RetentionDays} day(s).",
			purged, _options.RetentionDays);
	}
}
