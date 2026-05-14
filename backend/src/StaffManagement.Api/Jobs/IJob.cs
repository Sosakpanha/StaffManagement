namespace StaffManagement.Api.Jobs;

/// <summary>
/// One unit of scheduled work. Every job class implements this, gets its
/// dependencies via constructor injection, and is registered with the
/// scheduler from the SchedulerSettings list at startup.
/// </summary>
public interface IJob
{
	Task ExecuteAsync(CancellationToken cancellationToken = default);
}
