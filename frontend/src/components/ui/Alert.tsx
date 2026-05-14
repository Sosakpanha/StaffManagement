import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import {
	AlertTriangleIcon,
	CheckCircleIcon,
	InfoIcon,
	XCircleIcon,
} from './Icons'

type AlertTone = 'info' | 'success' | 'warning' | 'error'

interface AlertProps {
	tone?: AlertTone
	title?: ReactNode
	children?: ReactNode
	className?: string
}

const tones: Record<AlertTone, { bg: string; icon: typeof InfoIcon; text: string; border: string }> = {
	info: {
		bg: 'bg-blue-50',
		text: 'text-blue-800',
		border: 'border-blue-200',
		icon: InfoIcon,
	},
	success: {
		bg: 'bg-emerald-50',
		text: 'text-emerald-800',
		border: 'border-emerald-200',
		icon: CheckCircleIcon,
	},
	warning: {
		bg: 'bg-amber-50',
		text: 'text-amber-800',
		border: 'border-amber-200',
		icon: AlertTriangleIcon,
	},
	error: {
		bg: 'bg-red-50',
		text: 'text-red-800',
		border: 'border-red-200',
		icon: XCircleIcon,
	},
}

export function Alert({ tone = 'info', title, children, className }: AlertProps) {
	const conf = tones[tone]
	const Icon = conf.icon
	return (
		<div
			className={cn(
				'flex gap-3 rounded-md border px-4 py-3',
				conf.bg,
				conf.text,
				conf.border,
				className,
			)}
		>
			<Icon className="mt-0.5 shrink-0" width={18} height={18} />
			<div className="text-sm">
				{title && <div className="font-medium">{title}</div>}
				{children && <div className={cn(title ? 'mt-1' : '', 'text-sm opacity-90')}>{children}</div>}
			</div>
		</div>
	)
}
