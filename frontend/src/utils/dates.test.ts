import { describe, expect, it } from 'vitest'
import { formatDateTime, parseIsoDate, toIsoDate } from './dates'

describe('toIsoDate', () => {
	it('formats a Date as YYYY-MM-DD', () => {
		const d = new Date(2026, 0, 15) // local time, Jan 15
		expect(toIsoDate(d)).toBe('2026-01-15')
	})

	it('returns undefined for undefined or null', () => {
		expect(toIsoDate(undefined)).toBeUndefined()
		expect(toIsoDate(null)).toBeUndefined()
	})
})

describe('parseIsoDate', () => {
	it('parses YYYY-MM-DD strings', () => {
		const d = parseIsoDate('1990-05-15')
		expect(d).toBeInstanceOf(Date)
		expect(d?.getFullYear()).toBe(1990)
		expect(d?.getMonth()).toBe(4)
		expect(d?.getDate()).toBe(15)
	})

	it('returns undefined for empty / null / undefined / invalid', () => {
		expect(parseIsoDate(undefined)).toBeUndefined()
		expect(parseIsoDate(null)).toBeUndefined()
		expect(parseIsoDate('')).toBeUndefined()
		expect(parseIsoDate('not-a-date')).toBeUndefined()
	})

	it('round-trips with toIsoDate', () => {
		const iso = '1985-03-20'
		expect(toIsoDate(parseIsoDate(iso))).toBe(iso)
	})
})

describe('formatDateTime', () => {
	it('formats a datetime string', () => {
		expect(formatDateTime('2026-05-14T07:05:48.775')).toMatch(
			/^2026-05-14 \d{2}:\d{2}$/,
		)
	})

	it('returns empty string for empty input', () => {
		expect(formatDateTime(undefined)).toBe('')
		expect(formatDateTime(null)).toBe('')
		expect(formatDateTime('')).toBe('')
	})
})
