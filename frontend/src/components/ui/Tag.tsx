import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type TagTone =
	| 'slate'
	| 'blue'
	| 'green'
	| 'amber'
	| 'red'
	| 'magenta'
	| 'indigo'

interface TagProps {
	tone?: TagTone
	children: ReactNode
	className?: string
}

const tones: Record<TagTone, string> = {
	slate:   'bg-slate-100 text-slate-700 ring-slate-200',
	blue:    'bg-blue-50 text-blue-700 ring-blue-200',
	green:   'bg-emerald-50 text-emerald-700 ring-emerald-200',
	amber:   'bg-amber-50 text-amber-700 ring-amber-200',
	red:     'bg-red-50 text-red-700 ring-red-200',
	magenta: 'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200',
	indigo:  'bg-indigo-50 text-indigo-700 ring-indigo-200',
}

export function Tag({ tone = 'slate', children, className }: TagProps) {
	return (
		<span
			className={cn(
				'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
				tones[tone],
				className,
			)}
		>
			{children}
		</span>
	)
}

interface BadgeProps {
	count?: number
	dot?: boolean
	tone?: 'blue' | 'green' | 'amber' | 'red' | 'slate'
	className?: string
}

const dotTones: Record<NonNullable<BadgeProps['tone']>, string> = {
	blue:  'bg-blue-500',
	green: 'bg-emerald-500',
	amber: 'bg-amber-500',
	red:   'bg-red-500',
	slate: 'bg-slate-400',
}

export function Badge({ count, dot, tone = 'red', className }: BadgeProps) {
	if (dot) {
		return (
			<span className={cn('inline-block h-2 w-2 rounded-full', dotTones[tone], className)} />
		)
	}
	if (typeof count !== 'number') return null
	const display = count > 99 ? '99+' : count
	return (
		<span
			className={cn(
				'inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold text-white',
				dotTones[tone],
				className,
			)}
		>
			{display}
		</span>
	)
}
