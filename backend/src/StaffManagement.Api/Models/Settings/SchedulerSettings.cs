namespace StaffManagement.Api.Models.Settings;

public sealed class SchedulerSettings
{
	public List<JobEntry> Schedulers { get; set; } = new();
}

public sealed class JobEntry
{
	public string Id             { get; set; } = string.Empty;
	public string CronExpression { get; set; } = string.Empty;
	public bool   IsEnabled      { get; set; }
	public string ClassName      { get; set; } = string.Empty;
	public string AssemblyName   { get; set; } = string.Empty;
}
