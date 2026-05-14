import { type ReactNode, useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../lib/cn'
import { CloseIcon } from './Icons'

interface DrawerProps {
	open: boolean
	onClose: () => void
	title?: ReactNode
	children: ReactNode
	footer?: ReactNode
	width?: number | string
}

export function Drawer({ open, onClose, title, children, footer, width = 420 }: DrawerProps) {
	const titleId = useId()
	useEffect(() => {
		if (!open) return
		function onKey(e: KeyboardEvent) {
			if (e.key === 'Escape') onClose()
		}
		document.addEventListener('keydown', onKey)
		const prev = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		return () => {
			document.removeEventListener('keydown', onKey)
			document.body.style.overflow = prev
		}
	}, [open, onClose])

	if (!open) return null

	return createPortal(
		<div className="fixed inset-0 z-40">
			<div
				className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm anim-fade-in"
				onClick={onClose}
				aria-hidden="true"
			/>
			<aside
				role="dialog"
				aria-modal="true"
				aria-labelledby={title ? titleId : undefined}
				style={{ width: typeof width === 'number' ? `${width}px` : width }}
				className={cn(
					'absolute right-0 top-0 flex h-full flex-col bg-white shadow-xl',
					'anim-slide-in-right',
				)}
			>
				{title && (
					<header className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-3">
						<h2 id={titleId} className="text-base font-semibold text-slate-900">{title}</h2>
						<button
							type="button"
							onClick={onClose}
							aria-label="Close"
							className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
						>
							<CloseIcon width={18} height={18} />
						</button>
					</header>
				)}
				<div className="flex-1 overflow-auto px-5 py-4 text-sm">{children}</div>
				{footer && (
					<footer className="flex justify-end gap-2 border-t border-slate-200 px-5 py-3">
						{footer}
					</footer>
				)}
			</aside>
		</div>,
		document.body,
	)
}
