import { api } from './client'
import type {
	PagedResponse,
	StaffCreateRequest,
	StaffResponse,
	StaffSearchRequest,
	StaffUpdateRequest,
} from '../types/staff'

function pickDefined<T extends object>(obj: T): Partial<T> {
	const out: Partial<T> = {}
	for (const [k, v] of Object.entries(obj)) {
		if (v !== undefined && v !== null && v !== '') {
			(out as Record<string, unknown>)[k] = v
		}
	}
	return out
}

export async function searchStaff(
	request: StaffSearchRequest,
): Promise<PagedResponse<StaffResponse>> {
	const { data } = await api.get<PagedResponse<StaffResponse>>('/api/staff', {
		params: pickDefined(request),
	})
	return data
}

export async function getStaff(id: string): Promise<StaffResponse> {
	const { data } = await api.get<StaffResponse>(`/api/staff/${id}`)
	return data
}

export async function createStaff(
	request: StaffCreateRequest,
): Promise<StaffResponse> {
	const { data } = await api.post<StaffResponse>('/api/staff', request)
	return data
}

export async function updateStaff(
	id: string,
	request: StaffUpdateRequest,
): Promise<StaffResponse> {
	const { data } = await api.put<StaffResponse>(`/api/staff/${id}`, request)
	return data
}

export async function deleteStaff(id: string): Promise<void> {
	await api.delete(`/api/staff/${id}`)
}

export function buildExportUrl(
	kind: 'excel' | 'pdf',
	request: StaffSearchRequest,
): string {
	const base = api.defaults.baseURL ?? ''
	const search = new URLSearchParams()
	for (const [k, v] of Object.entries(pickDefined(request))) {
		search.set(k, String(v))
	}
	const qs = search.toString()
	return `${base}/api/staff/export/${kind}${qs ? `?${qs}` : ''}`
}
