using StaffManagement.Api.Models.Responses.Staff;

namespace StaffManagement.Api.Exports.Interfaces;

public interface IStaffExporter
{
	/// <summary>
	/// MIME content type of the produced document (e.g. application/pdf).
	/// </summary>
	string ContentType { get; }

	/// <summary>
	/// Default filename suffix including the extension (e.g. ".xlsx").
	/// </summary>
	string FileExtension { get; }

	byte[] Export(IReadOnlyList<StaffResponse> staff);
}
