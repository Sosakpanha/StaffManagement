import { expect, test } from '@playwright/test'
import { deleteByStaffId, uniqueStaffId } from './helpers'

test.describe('Staff CRUD', () => {
	const staffId = uniqueStaffId('PC')
	const fullName = `Pat Crud ${staffId}`
	const updatedName = `Pat Updated ${staffId}`

	test.afterAll(async ({ request }) => {
		await deleteByStaffId(request, staffId)
	})

	test('lands on the staff list', async ({ page }) => {
		await page.goto('/')
		await expect(page).toHaveURL(/\/staff$/)
		await expect(
			page.getByRole('heading', { level: 3, name: 'Staff' }),
		).toBeVisible()
	})

	test('creates a new staff member', async ({ page }) => {
		await page.goto('/staff')
		await page.getByRole('button', { name: /New staff/i }).click()
		await expect(page).toHaveURL(/\/staff\/new$/)

		await page.getByLabel('Staff ID').fill(staffId)
		await page.getByLabel('Full name').fill(fullName)

		// Birthday picker — open the calendar and pick any selectable day.
		// We don't care which day for this happy-path test; we just need
		// the form to have a valid date so it submits.
		await page.getByRole('button', { name: /YYYY-MM-DD/ }).click()
		await page.locator('.rdp-day_button').first().click()

		// Gender default is 1 (Male) — leave it.
		await page.getByRole('button', { name: /Create staff/i }).click()
		await expect(page).toHaveURL(/\/staff$/)

		await page.getByPlaceholder('Search by full name').fill(fullName)
		await page.getByRole('button', { name: 'Search', exact: true }).click()
		await expect(page.getByRole('cell', { name: fullName, exact: true })).toBeVisible()
		await expect(page.getByRole('cell', { name: staffId, exact: true })).toBeVisible()
	})

	test('edits the staff member', async ({ page }) => {
		await page.goto('/staff')
		await page.getByPlaceholder('Search by full name').fill(fullName)
		await page.getByRole('button', { name: 'Search', exact: true }).click()
		await page.getByRole('button', { name: /Edit/i }).first().click()
		await expect(page).toHaveURL(/\/staff\/.+/)

		const nameInput = page.getByLabel('Full name')
		await nameInput.fill('')
		await nameInput.fill(updatedName)
		await page.getByRole('button', { name: /Save changes/i }).click()
		await expect(page).toHaveURL(/\/staff$/)

		await page.getByPlaceholder('Search by full name').fill(updatedName)
		await page.getByRole('button', { name: 'Search', exact: true }).click()
		await expect(page.getByRole('cell', { name: updatedName, exact: true })).toBeVisible()
	})

	test('deletes the staff member', async ({ page }) => {
		await page.goto('/staff')
		await page.getByPlaceholder('Search by full name').fill(updatedName)
		await page.getByRole('button', { name: 'Search', exact: true }).click()
		await page.getByRole('button', { name: /Delete/i }).first().click()

		const dialog = page.getByRole('dialog', { name: /Delete staff/i })
		await expect(dialog).toBeVisible()
		await expect(dialog.getByText(/permanently delete/i)).toBeVisible()
		await dialog.getByRole('button', { name: 'Delete' }).click()

		await expect(page.getByRole('cell', { name: updatedName, exact: true })).toHaveCount(0)
	})
})
