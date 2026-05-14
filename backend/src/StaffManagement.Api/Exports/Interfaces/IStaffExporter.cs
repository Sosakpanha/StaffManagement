using StaffManagement.Api.Models.Responses.Staff;

namespace StaffManagement.Api.Exports.Interfaces;

public interface IStaffExporter
{
	string ContentType { get; }

	string FileExtension { get; }

	byte[] Export(IReadOnlyList<StaffResponse> staff);
}
