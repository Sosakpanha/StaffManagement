using System.Collections.Concurrent;
using Hangfire;
using Microsoft.Extensions.Options;
using StaffManagement.Api.Jobs;
using StaffManagement.Api.Models.Settings;

namespace StaffManagement.Api.HostedServices;

/// <summary>
/// At startup, reads the list of jobs from SchedulerSettings and tells
/// Hangfire to run each enabled one on its cron. The runner itself only
/// schedules; Hangfire's own server is what fires the jobs when their
/// time comes.
///
/// A small dictionary stops the same job running twice at once: if the
/// previous run hasn't finished by the time the next tick arrives, the
/// new tick logs a skip and exits.
/// </summary>
public sealed class JobRunner : IHostedService
{
	private static readonly ConcurrentDictionary<Type, bool> InFlight = new();

	private readonly IServiceProvider _services;
	private readonly IRecurringJobManager _recurringJobs;
	private readonly SchedulerSettings _settings;
	private readonly ILogger<JobRunner> _logger;

	public JobRunner(
		IServiceProvider services,
		IRecurringJobManager recurringJobs,
		IOptions<SchedulerSettings> settings,
		ILogger<JobRunner> logger)
	{
		_services = services;
		_recurringJobs = recurringJobs;
		_settings = settings.Value;
		_logger = logger;
	}

	public Task StartAsync(CancellationToken cancellationToken)
	{
		foreach (var entry in _settings.Schedulers)
		{
			var typeName = $"{entry.ClassName},{entry.AssemblyName}";
			var jobType = Type.GetType(typeName);

			if (jobType is null)
			{
				_logger.LogError("JobRunner could not load type {TypeName} for job {Id}.", typeName, entry.Id);
				continue;
			}

			if (!entry.IsEnabled)
			{
				_logger.LogInformation("JobRunner skipping disabled job {Id} ({Type}).", entry.Id, jobType.Name);
				_recurringJobs.RemoveIfExists(entry.Id);
				continue;
			}

			_logger.LogInformation(
				"JobRunner registering job {Id} ({Type}) on cron '{Cron}'.",
				entry.Id, jobType.Name, entry.CronExpression);

			_recurringJobs.AddOrUpdate(
				entry.Id,
				() => InvokeAsync(jobType),
				entry.CronExpression);
		}

		return Task.CompletedTask;
	}

	public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;

	// Public so Hangfire's expression-tree job lookup can find it.
	public async Task InvokeAsync(Type jobType)
	{
		if (InFlight.TryGetValue(jobType, out var running) && running)
		{
			_logger.LogInformation("JobRunner skipping {Job}; previous run still in flight.", jobType.Name);
			return;
		}

		InFlight[jobType] = true;
		try
		{
			using var scope = _services.CreateScope();
			var instance = (IJob)ActivatorUtilities.CreateInstance(scope.ServiceProvider, jobType);
			await instance.ExecuteAsync();
		}
		catch (Exception ex)
		{
			_logger.LogError(ex, "JobRunner caught an unhandled exception in {Job}.", jobType.Name);
			throw;
		}
		finally
		{
			InFlight[jobType] = false;
		}
	}
}
