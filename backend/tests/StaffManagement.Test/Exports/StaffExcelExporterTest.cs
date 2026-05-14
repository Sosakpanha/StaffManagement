using ClosedXML.Excel;
using FluentAssertions;
using StaffManagement.Api.Exports;
using StaffManagement.Api.Models.Responses.Staff;

namespace StaffManagement.Test.Exports;

[TestFixture]
public class StaffExcelExporterTest
{
	[Test]
	public void Export_should_produce_valid_xlsx_with_header_and_rows()
	{
		var exporter = new StaffExcelExporter();
		var staff = new List<StaffResponse>
		{
			new()
			{
				StaffId  = "SM00001",
				FullName = "Alice",
				Birthday = new DateOnly(1990, 5, 15),
				Gender   = 1
			},
			new()
			{
				StaffId  = "SM00002",
				FullName = "Bob",
				Birthday = new DateOnly(1985, 3, 20),
				Gender   = 2
			}
		};

		var bytes = exporter.Export(staff);

		bytes.Should().NotBeNull();
		bytes.Length.Should().BeGreaterThan(0);

		using var stream = new MemoryStream(bytes);
		using var workbook = new XLWorkbook(stream);
		var sheet = workbook.Worksheets.First();

		sheet.Cell(1, 1).GetString().Should().Be("Staff ID");
		sheet.Cell(1, 2).GetString().Should().Be("Full Name");
		sheet.Cell(2, 1).GetString().Should().Be("SM00001");
		sheet.Cell(2, 2).GetString().Should().Be("Alice");
		sheet.Cell(2, 4).GetString().Should().Be("Male");
		sheet.Cell(3, 1).GetString().Should().Be("SM00002");
		sheet.Cell(3, 4).GetString().Should().Be("Female");
	}

	[Test]
	public void Export_should_succeed_when_list_is_empty()
	{
		var bytes = new StaffExcelExporter().Export(Array.Empty<StaffResponse>());

		bytes.Should().NotBeNull();
		bytes.Length.Should().BeGreaterThan(0);   // workbook + header still produces a file
	}

	[Test]
	public void Export_should_advertise_correct_content_type_and_extension()
	{
		var exporter = new StaffExcelExporter();
		exporter.ContentType.Should().Be("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
		exporter.FileExtension.Should().Be(".xlsx");
	}
}
