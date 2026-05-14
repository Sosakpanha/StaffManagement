import dayjs from 'dayjs'

const ISO_DATE = 'YYYY-MM-DD'

export function toIsoDate(d: Date | undefined | null): string | undefined {
	return d ? dayjs(d).format(ISO_DATE) : undefined
}

export function parseIsoDate(s: string | undefined | null): Date | undefined {
	if (!s) return undefined
	const d = dayjs(s, ISO_DATE, true)
	return d.isValid() ? d.toDate() : undefined
}

export function formatIsoDate(s: string | undefined | null): string {
	return s ?? ''
}

export function formatDateTime(s: string | undefined | null): string {
	if (!s) return ''
	return dayjs(s).format('YYYY-MM-DD HH:mm')
}
