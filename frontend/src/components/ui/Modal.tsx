import { type ReactNode, useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../lib/cn'
import { Button } from './Button'
import { CloseIcon } from './Icons'

interface ModalProps {
	open: boolean
	onClose: () => void
	title?: ReactNode
	children: ReactNode
	footer?: ReactNode
	width?: 'sm' | 'md' | 'lg'
}

const widths = {
	sm: 'max-w-sm',
	md: 'max-w-md',
	lg: 'max-w-2xl',
}

export function Modal({ open, onClose, title, children, footer, width = 'md' }: ModalProps) {
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
		<div className="fixed inset-0 z-40 flex items-center justify-center p-4">
			<div
				className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm anim-fade-in"
				onClick={onClose}
				aria-hidden="true"
			/>
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby={title ? titleId : undefined}
				className={cn(
					'relative z-10 w-full rounded-lg bg-white shadow-xl anim-zoom-in',
					widths[width],
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
				<div className="px-5 py-4 text-sm text-slate-700">{children}</div>
				{footer && (
					<footer className="flex justify-end gap-2 border-t border-slate-200 px-5 py-3">
						{footer}
					</footer>
				)}
			</div>
		</div>,
		document.body,
	)
}

interface ConfirmModalProps {
	open: boolean
	title?: ReactNode
	description?: ReactNode
	confirmText?: string
	cancelText?: string
	danger?: boolean
	loading?: boolean
	onConfirm: () => void
	onCancel: () => void
}

export function ConfirmModal({
	open,
	title = 'Are you sure?',
	description,
	confirmText = 'Confirm',
	cancelText = 'Cancel',
	danger = false,
	loading = false,
	onConfirm,
	onCancel,
}: ConfirmModalProps) {
	return (
		<Modal
			open={open}
			onClose={onCancel}
			title={title}
			width="sm"
			footer={
				<>
					<Button onClick={onCancel} disabled={loading}>
						{cancelText}
					</Button>
					<Button
						variant={danger ? 'danger' : 'primary'}
						onClick={onConfirm}
						loading={loading}
					>
						{confirmText}
					</Button>
				</>
			}
		>
			{description}
		</Modal>
	)
}
