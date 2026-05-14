import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface CardProps {
	title?: ReactNode
	description?: ReactNode
	actions?: ReactNode
	children: ReactNode
	className?: string
}

export function Card({ title, description, actions, children, className }: CardProps) {
	const hasHeader = title || description || actions
	return (
		<section
			className={cn(
				'rounded-lg border border-slate-200 bg-white shadow-sm',
				className,
			)}
		>
			{hasHeader && (
				<header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
					<div>
						{title && (
							<h3 className="text-base font-semibold text-slate-900">{title}</h3>
						)}
						{description && (
							<p className="mt-1 text-sm text-slate-500">{description}</p>
						)}
					</div>
					{actions && <div className="flex gap-2">{actions}</div>}
				</header>
			)}
			<div className="px-5 py-4">{children}</div>
		</section>
	)
}
