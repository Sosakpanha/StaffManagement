using Microsoft.AspNetCore.Mvc;
using StaffManagement.Api.Exports;
using StaffManagement.Api.Models.Requests.Staff;
using StaffManagement.Api.Services.Interfaces;

namespace StaffManagement.Api.Controllers;

[ApiController]
[Route("api/staff/export")]
public class StaffExportController : ControllerBase
{
	// Sanity cap so a malicious or accidentally-broad export can't ask
	// for millions of rows. The frontend can override per query.
	private const int MaxExportPageSize = 10_000;

	private readonly IStaffService _staffService;
	private readonly StaffExcelExporter _excelExporter;
	private readonly StaffPdfExporter _pdfExporter;

	public StaffExportController(
		IStaffService staffService,
		StaffExcelExporter excelExporter,
		StaffPdfExporter pdfExporter)
	{
		_staffService = staffService;
		_excelExporter = excelExporter;
		_pdfExporter = pdfExporter;
	}

	[HttpGet("excel")]
	public async Task<IActionResult> ExportExcel(
		[FromQuery] StaffSearchRequest request,
		CancellationToken cancellationToken)
	{
		var staff = await GetExportSetAsync(request, cancellationToken);
		var bytes = _excelExporter.Export(staff);
		return File(bytes, _excelExporter.ContentType, BuildFileName(_excelExporter.FileExtension));
	}

	[HttpGet("pdf")]
	public async Task<IActionResult> ExportPdf(
		[FromQuery] StaffSearchRequest request,
		CancellationToken cancellationToken)
	{
		var staff = await GetExportSetAsync(request, cancellationToken);
		var bytes = _pdfExporter.Export(staff);
		return File(bytes, _pdfExporter.ContentType, BuildFileName(_pdfExporter.FileExtension));
	}

	private async Task<IReadOnlyList<Models.Responses.Staff.StaffResponse>> GetExportSetAsync(
		StaffSearchRequest request,
		CancellationToken cancellationToken)
	{
		// Export always returns the full filtered set, not just the current page.
		request.Page = 1;
		request.PageSize = MaxExportPageSize;
		var result = await _staffService.SearchAsync(request, cancellationToken);
		return result.Items;
	}

	private static string BuildFileName(string extension) =>
		$"staff-{DateTime.UtcNow:yyyyMMdd-HHmmss}{extension}";
}
