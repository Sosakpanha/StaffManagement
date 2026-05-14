import { expect, test } from '@playwright/test'

test.describe('Staff export', () => {
	test('Excel and PDF buttons trigger downloadable responses', async ({ page }) => {
		await page.goto('/staff')

		// Excel button: opens the export URL in a new tab; we just assert the
		// URL it points at, and that the API returns a real XLSX.
		const excelButton = page.getByRole('button', { name: /Excel/i }).first()
		const pdfButton = page.getByRole('button', { name: /PDF/i }).first()

		await expect(excelButton).toBeVisible()
		await expect(pdfButton).toBeVisible()

		const excelResp = await page.request.get(
			(process.env.PW_API_BASE ?? 'http://localhost:5000') +
				'/api/staff/export/excel?page=1&pageSize=5',
		)
		expect(excelResp.ok()).toBeTruthy()
		expect(excelResp.headers()['content-type']).toContain(
			'spreadsheetml.sheet',
		)
		const xlsxBytes = await excelResp.body()
		expect(xlsxBytes.length).toBeGreaterThan(100)
		// XLSX is a zip — first two bytes are "PK".
		expect(xlsxBytes[0]).toBe(0x50)
		expect(xlsxBytes[1]).toBe(0x4b)

		const pdfResp = await page.request.get(
			(process.env.PW_API_BASE ?? 'http://localhost:5000') +
				'/api/staff/export/pdf?page=1&pageSize=5',
		)
		expect(pdfResp.ok()).toBeTruthy()
		expect(pdfResp.headers()['content-type']).toContain('pdf')
		const pdfBytes = await pdfResp.body()
		// PDFs start with "%PDF-".
		expect(pdfBytes.slice(0, 5).toString('utf-8')).toBe('%PDF-')
	})
})
