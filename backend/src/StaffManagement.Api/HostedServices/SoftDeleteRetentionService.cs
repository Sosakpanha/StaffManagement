using Microsoft.Extensions.Options;
using StaffManagement.Api.Repositories.Interfaces;

namespace StaffManagement.Api.HostedServices;

public sealed class SoftDeleteRetentionOptions
{
	public bool Enabled { get; set; } = true;

	public int RetentionDays { get; set; } = 90;

	public int IntervalHours { get; set; } = 24;
}

/// <summary>
/// Once a day, hard-deletes Staff rows that have been soft-deleted longer
/// than <see cref="SoftDeleteRetentionOptions.RetentionDays"/>. Safe to
/// run on multiple replicas — the SP's DELETE is idempotent. For a true
/// "exactly once" guarantee you'd front it with sp_getapplock or a
/// distributed scheduler; not worth it at the scale this is built for.
/// </summary>
public sealed class SoftDeleteRetentionService : BackgroundService
{
	private readonly IStaffRepository _repository;
	private readonly SoftDeleteRetentionOptions _options;
	private readonly ILogger<SoftDeleteRetentionService> _logger;

	public SoftDeleteRetentionService(
		IStaffRepository repository,
		IOptions<SoftDeleteRetentionOptions> options,
		ILogger<SoftDeleteRetentionService> logger)
	{
		_repository = repository;
		_options = options.Value;
		_logger = logger;
	}

	protected override async Task ExecuteAsync(CancellationToken stoppingToken)
	{
		if (!_options.Enabled)
		{
			_logger.LogInformation("SoftDeleteRetentionService is disabled via configuration; not scheduling.");
			return;
		}

		var interval = TimeSpan.FromHours(_options.IntervalHours);
		_logger.LogInformation(
			"SoftDeleteRetentionService scheduled every {Interval} with retention {RetentionDays} days.",
			interval, _options.RetentionDays);

		while (!stoppingToken.IsCancellationRequested)
		{
			try
			{
				var purged = await _repository.PurgeSoftDeletedAsync(_options.RetentionDays, stoppingToken);
				_logger.LogInformation(
					"SoftDeleteRetentionService purged {PurgedCount} row(s) older than {RetentionDays} days.",
					purged, _options.RetentionDays);
			}
			catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
			{
				break;
			}
			catch (Exception ex)
			{
				// Don't let a transient DB error tear the service down; sleep
				// and try again on the next interval.
				_logger.LogError(ex, "SoftDeleteRetentionService run failed; will retry on the next interval.");
			}

			try
			{
				await Task.Delay(interval, stoppingToken);
			}
			catch (OperationCanceledException)
			{
				break;
			}
		}
	}
}
