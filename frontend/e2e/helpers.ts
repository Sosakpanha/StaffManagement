import type { APIRequestContext } from '@playwright/test'

const API_BASE = process.env.PW_API_BASE ?? 'http://localhost:5000'

export function uniqueStaffId(prefix = 'PW'): string {
	// 8 chars max. Use last 6 of timestamp + 2-char prefix.
	const ts = Date.now().toString().slice(-6)
	return `${prefix}${ts}`
}

export async function deleteByStaffId(
	request: APIRequestContext,
	staffId: string,
) {
	const r = await request.get(`${API_BASE}/api/staff?staffId=${staffId}`)
	if (!r.ok()) return
	const page = (await r.json()) as { items?: { id: string }[] }
	for (const item of page.items ?? []) {
		await request.delete(`${API_BASE}/api/staff/${item.id}`)
	}
}

export { API_BASE }
