// Mirrors backend DTOs in StaffManagement.Api.Models.* (camelCase via Newtonsoft).

export type Gender = 1 | 2

export interface StaffResponse {
	id: string
	staffId: string
	fullName: string
	birthday: string // YYYY-MM-DD
	gender: Gender
	createdAt: string
	updatedAt: string
}

export interface PagedResponse<T> {
	items: T[]
	totalCount: number
	page: number
	pageSize: number
	totalPages: number
}

export interface StaffCreateRequest {
	staffId: string
	fullName: string
	birthday: string
	gender: Gender
}

export type StaffUpdateRequest = StaffCreateRequest

export interface StaffSearchRequest {
	staffId?: string
	gender?: Gender
	birthdayFrom?: string
	birthdayTo?: string
	fullName?: string
	page?: number
	pageSize?: number
	sortBy?: string
	sortDir?: 'asc' | 'desc'
}

export interface ApiError {
	code: number
	message: string
}
