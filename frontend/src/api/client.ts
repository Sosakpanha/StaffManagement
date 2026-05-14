import axios, { AxiosError } from 'axios'
import type { ApiError } from '../types/staff'

const baseURL =
	(import.meta.env.VITE_API_BASE_URL as string | undefined) ??
	'http://localhost:5278'

export const api = axios.create({
	baseURL,
	timeout: 15_000,
	headers: { 'Content-Type': 'application/json' },
})

export class ApiException extends Error {
	readonly code: number
	readonly status: number
	constructor(code: number, message: string, status: number) {
		super(message)
		this.code = code
		this.status = status
	}
}

api.interceptors.response.use(
	(r) => r,
	(error: AxiosError<ApiError>) => {
		if (error.response) {
			const status = error.response.status
			const body = error.response.data
			if (body && typeof body === 'object' && 'code' in body && 'message' in body) {
				return Promise.reject(new ApiException(body.code, body.message, status))
			}
			return Promise.reject(
				new ApiException(0, `Request failed with status ${status}`, status),
			)
		}
		return Promise.reject(new ApiException(0, error.message || 'Network error', 0))
	},
)
