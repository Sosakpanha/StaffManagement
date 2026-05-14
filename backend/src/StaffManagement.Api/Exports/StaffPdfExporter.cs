using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using StaffManagement.Api.Exports.Interfaces;
using StaffManagement.Api.Models.Responses.Staff;

namespace StaffManagement.Api.Exports;

public sealed class StaffPdfExporter : IStaffExporter
{
	public string ContentType => "application/pdf";

	public string FileExtension => ".pdf";

	public byte[] Export(IReadOnlyList<StaffResponse> staff)
	{
		var document = Document.Create(container =>
		{
			container.Page(page =>
			{
				page.Size(PageSizes.A4.Landscape());
				page.Margin(1.5f, Unit.Centimetre);
				page.DefaultTextStyle(t => t.FontSize(10));

				page.Header()
					.Text("Staff Report")
					.SemiBold().FontSize(16).FontColor(Colors.Blue.Medium);

				page.Content().PaddingVertical(0.5f, Unit.Centimetre).Column(column =>
				{
					column.Item().Text($"Generated: {DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC").FontSize(9).FontColor(Colors.Grey.Darken1);
					column.Item().Text($"Total records: {staff.Count}").FontSize(9).FontColor(Colors.Grey.Darken1);

					column.Item().PaddingTop(0.5f, Unit.Centimetre).Table(table =>
					{
						table.ColumnsDefinition(c =>
						{
							c.RelativeColumn(2);   // Staff ID
							c.RelativeColumn(4);   // Full Name
							c.RelativeColumn(2);   // Birthday
							c.RelativeColumn(2);   // Gender
						});

						table.Header(header =>
						{
							header.Cell().Element(HeaderCell).Text("Staff ID");
							header.Cell().Element(HeaderCell).Text("Full Name");
							header.Cell().Element(HeaderCell).Text("Birthday");
							header.Cell().Element(HeaderCell).Text("Gender");

							static IContainer HeaderCell(IContainer c) => c
								.DefaultTextStyle(t => t.SemiBold())
								.PaddingVertical(5).PaddingHorizontal(4)
								.Background(Colors.Grey.Lighten2)
								.BorderBottom(1).BorderColor(Colors.Grey.Darken1);
						});

						foreach (var s in staff)
						{
							table.Cell().Element(BodyCell).Text(s.StaffId);
							table.Cell().Element(BodyCell).Text(s.FullName);
							table.Cell().Element(BodyCell).Text(s.Birthday.ToString("yyyy-MM-dd"));
							table.Cell().Element(BodyCell).Text(s.Gender == 1 ? "Male" : "Female");
						}

						static IContainer BodyCell(IContainer c) => c
							.PaddingVertical(4).PaddingHorizontal(4)
							.BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten1);
					});
				});

				page.Footer().AlignRight().Text(t =>
				{
					t.Span("Page ").FontSize(9).FontColor(Colors.Grey.Darken1);
					t.CurrentPageNumber().FontSize(9).FontColor(Colors.Grey.Darken1);
					t.Span(" of ").FontSize(9).FontColor(Colors.Grey.Darken1);
					t.TotalPages().FontSize(9).FontColor(Colors.Grey.Darken1);
				});
			});
		});

		return document.GeneratePdf();
	}
}
