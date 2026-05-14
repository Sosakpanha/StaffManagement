using System.Net;
using System.Net.Http.Json;
using ClosedXML.Excel;
using FluentAssertions;

namespace StaffManagement.Test.Endpoints;

[TestFixture]
public class StaffExportEndpointsTest : EndpointTestBase
{
	[SetUp]
	public async Task Seed()
	{
		await Client.PostAsJsonAsync("/api/staff", new
		{
			staffId  = "SM00001",
			fullName = "Alice Cooper",
			birthday = "1990-05-15",
			gender   = 1
		});
	}

	[Test]
	public async Task ExportExcel_should_return_valid_xlsx_with_expected_content_type()
	{
		var response = await Client.GetAsync("/api/staff/export/excel");

		response.StatusCode.Should().Be(HttpStatusCode.OK);
		response.Content.Headers.ContentType!.MediaType.Should()
			.Be("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
		response.Content.Headers.ContentDisposition!.FileName.Should().EndWith(".xlsx");

		var bytes = await response.Content.ReadAsByteArrayAsync();
		bytes.Length.Should().BeGreaterThan(0);

		using var stream = new MemoryStream(bytes);
		using var workbook = new XLWorkbook(stream);
		var sheet = workbook.Worksheets.First();
		sheet.Cell(1, 1).GetString().Should().Be("Staff ID");
		sheet.Cell(2, 1).GetString().Should().Be("SM00001");
	}

	[Test]
	public async Task ExportPdf_should_return_pdf_with_expected_content_type()
	{
		var response = await Client.GetAsync("/api/staff/export/pdf");

		response.StatusCode.Should().Be(HttpStatusCode.OK);
		response.Content.Headers.ContentType!.MediaType.Should().Be("application/pdf");
		response.Content.Headers.ContentDisposition!.FileName.Should().EndWith(".pdf");

		var bytes = await response.Content.ReadAsByteArrayAsync();
		bytes.Length.Should().BeGreaterThan(0);
		// Every PDF starts with the magic bytes "%PDF-".
		bytes.Take(5).Should().Equal(new byte[] { 0x25, 0x50, 0x44, 0x46, 0x2D });
	}

	[Test]
	public async Task Export_should_respect_filter_query()
	{
		// Add a second staff with a different gender and filter to only that one.
		await Client.PostAsJsonAsync("/api/staff", new
		{
			staffId  = "SM00002",
			fullName = "Bob Builder",
			birthday = "1985-03-20",
			gender   = 2
		});

		var response = await Client.GetAsync("/api/staff/export/excel?gender=2");
		response.StatusCode.Should().Be(HttpStatusCode.OK);

		var bytes = await response.Content.ReadAsByteArrayAsync();
		using var stream = new MemoryStream(bytes);
		using var workbook = new XLWorkbook(stream);
		var sheet = workbook.Worksheets.First();

		sheet.Cell(2, 1).GetString().Should().Be("SM00002");
		// Only one data row beyond the header.
		sheet.Cell(3, 1).GetString().Should().BeEmpty();
	}
}
