import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface FieldProps {
	label?: ReactNode
	htmlFor?: string
	required?: boolean
	hint?: ReactNode
	error?: ReactNode
	children: ReactNode
	className?: string
}

/**
 * Layout wrapper for a labelled form input. Pass an `error` to render a
 * red helper line beneath the field; the child input is expected to
 * apply its own error styling (e.g. via aria-invalid).
 */
export function Field({ label, htmlFor, required, hint, error, children, className }: FieldProps) {
	return (
		<div className={cn('flex flex-col gap-1.5', className)}>
			{label && (
				<label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
					{label}
					{required && <span className="ml-0.5 text-red-600">*</span>}
				</label>
			)}
			{children}
			{error ? (
				<p className="text-xs text-red-600">{error}</p>
			) : hint ? (
				<p className="text-xs text-slate-500">{hint}</p>
			) : null}
		</div>
	)
}
