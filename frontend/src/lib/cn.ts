import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combine class names. Later classes override earlier ones cleanly
 * thanks to tailwind-merge (e.g. `cn('px-2', 'px-4')` → `px-4`).
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}
