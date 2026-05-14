using Hangfire;
using Hangfire.InMemory;

namespace StaffManagement.Api.Extensions;

public static class HangfireExtensions
{
	/// <summary>
	/// Registers Hangfire with the in-memory storage backend and a single
	/// server. In-memory storage is per-process; multi-replica deployments
	/// should swap this for SqlServer storage so all replicas share the
	/// same schedule.
	/// </summary>
	public static IServiceCollection AddJobScheduler(this IServiceCollection services)
	{
		services.AddHangfire(config => config
			.SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
			.UseSimpleAssemblyNameTypeSerializer()
			.UseRecommendedSerializerSettings()
			.UseInMemoryStorage());

		services.AddHangfireServer(options =>
		{
			options.SchedulePollingInterval = TimeSpan.FromSeconds(15);
		});

		return services;
	}
}
