import { expect, test } from '@playwright/test'
import { API_BASE, deleteByStaffId, uniqueStaffId } from './helpers'

test.describe('Staff search', () => {
	const aId = uniqueStaffId('SA')
	const bId = uniqueStaffId('SB')

	test.beforeAll(async ({ request }) => {
		const aResp = await request.post(`${API_BASE}/api/staff`, {
			data: {
				staffId: aId,
				fullName: `Search Alpha ${aId}`,
				birthday: '1980-06-10',
				gender: 1,
			},
		})
		expect(aResp.ok()).toBeTruthy()
		const bResp = await request.post(`${API_BASE}/api/staff`, {
			data: {
				staffId: bId,
				fullName: `Search Beta ${bId}`,
				birthday: '1995-02-20',
				gender: 2,
			},
		})
		expect(bResp.ok()).toBeTruthy()
	})

	test.afterAll(async ({ request }) => {
		await deleteByStaffId(request, aId)
		await deleteByStaffId(request, bId)
	})

	test('quick search filters by full name', async ({ page }) => {
		await page.goto('/staff')
		await page.getByPlaceholder('Search by full name').fill(`Search Alpha ${aId}`)
		await page.getByRole('button', { name: 'Search', exact: true }).click()
		await expect(
			page.getByRole('cell', { name: `Search Alpha ${aId}`, exact: true }),
		).toBeVisible()
		await expect(
			page.getByRole('cell', { name: `Search Beta ${bId}`, exact: true }),
		).toHaveCount(0)
	})

	test('advanced search filters by StaffId', async ({ page }) => {
		await page.goto('/staff')
		await page.getByRole('button', { name: /Advanced search/i }).click()
		const drawer = page.getByRole('dialog', { name: /Advanced search/i })
		await drawer.getByLabel('Staff ID').fill(bId)
		await drawer.getByRole('button', { name: 'Apply' }).click()
		await expect(
			page.getByRole('cell', { name: `Search Beta ${bId}`, exact: true }),
		).toBeVisible()
		await expect(
			page.getByRole('cell', { name: `Search Alpha ${aId}`, exact: true }),
		).toHaveCount(0)
	})
})
