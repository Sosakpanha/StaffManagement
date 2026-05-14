import { describe, expect, it } from 'vitest'
import { staffFormSchema } from './staff'

describe('staffFormSchema', () => {
	const valid = {
		staffId: 'E000001',
		fullName: 'Jane Doe',
		birthday: new Date(1990, 0, 15),
		gender: 1 as const,
	}

	it('accepts valid input', () => {
		expect(staffFormSchema.safeParse(valid).success).toBe(true)
	})

	it('rejects empty staffId', () => {
		const r = staffFormSchema.safeParse({ ...valid, staffId: '' })
		expect(r.success).toBe(false)
		if (!r.success) {
			expect(r.error.issues.some((i) => i.path[0] === 'staffId')).toBe(true)
		}
	})

	it('rejects staffId longer than 8 chars', () => {
		const r = staffFormSchema.safeParse({ ...valid, staffId: 'TOO_LONG_ID' })
		expect(r.success).toBe(false)
	})

	it('rejects empty fullName', () => {
		const r = staffFormSchema.safeParse({ ...valid, fullName: '' })
		expect(r.success).toBe(false)
	})

	it('rejects missing birthday', () => {
		const r = staffFormSchema.safeParse({ ...valid, birthday: undefined })
		expect(r.success).toBe(false)
	})

	it('rejects an out-of-range gender', () => {
		const r = staffFormSchema.safeParse({ ...valid, gender: 3 })
		expect(r.success).toBe(false)
	})

	it('accepts gender 2', () => {
		const r = staffFormSchema.safeParse({ ...valid, gender: 2 })
		expect(r.success).toBe(true)
	})
})
