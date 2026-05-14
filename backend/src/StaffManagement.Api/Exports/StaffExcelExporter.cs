using ClosedXML.Excel;
using StaffManagement.Api.Exports.Interfaces;
using StaffManagement.Api.Models.Responses.Staff;

namespace StaffManagement.Api.Exports;

public sealed class StaffExcelExporter : IStaffExporter
{
	public string ContentType => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

	public string FileExtension => ".xlsx";

	public byte[] Export(IReadOnlyList<StaffResponse> staff)
	{
		using var workbook = new XLWorkbook();
		var sheet = workbook.Worksheets.Add("Staff");

		sheet.Cell(1, 1).Value = "Staff ID";
		sheet.Cell(1, 2).Value = "Full Name";
		sheet.Cell(1, 3).Value = "Birthday";
		sheet.Cell(1, 4).Value = "Gender";
		sheet.Cell(1, 5).Value = "Created At";
		sheet.Cell(1, 6).Value = "Updated At";

		var headerRange = sheet.Range(1, 1, 1, 6);
		headerRange.Style.Font.Bold = true;
		headerRange.Style.Fill.BackgroundColor = XLColor.LightGray;

		for (var i = 0; i < staff.Count; i++)
		{
			var s = staff[i];
			var row = i + 2;

			sheet.Cell(row, 1).Value = s.StaffId;
			sheet.Cell(row, 2).Value = s.FullName;
			sheet.Cell(row, 3).Value = s.Birthday.ToDateTime(TimeOnly.MinValue);
			sheet.Cell(row, 3).Style.DateFormat.Format = "yyyy-MM-dd";
			sheet.Cell(row, 4).Value = s.Gender == 1 ? "Male" : "Female";
			sheet.Cell(row, 5).Value = s.CreatedAt;
			sheet.Cell(row, 5).Style.DateFormat.Format = "yyyy-MM-dd HH:mm:ss";
			sheet.Cell(row, 6).Value = s.UpdatedAt;
			sheet.Cell(row, 6).Style.DateFormat.Format = "yyyy-MM-dd HH:mm:ss";
		}

		sheet.Columns().AdjustToContents();

		using var stream = new MemoryStream();
		workbook.SaveAs(stream);
		return stream.ToArray();
	}
}
