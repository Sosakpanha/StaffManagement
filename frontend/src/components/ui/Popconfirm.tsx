import { type ReactNode, cloneElement, isValidElement, useEffect, useRef, useState } from 'react'
import { Button } from './Button'

interface PopconfirmProps {
	title: ReactNode
	description?: ReactNode
	confirmText?: string
	cancelText?: string
	danger?: boolean
	onConfirm: () => void | Promise<void>
	children: ReactNode
}

/**
 * Click the wrapped child to open a small confirmation popover anchored
 * underneath it.
 */
export function Popconfirm({
	title,
	description,
	confirmText = 'Confirm',
	cancelText = 'Cancel',
	danger = false,
	onConfirm,
	children,
}: PopconfirmProps) {
	const [open, setOpen] = useState(false)
	const [busy, setBusy] = useState(false)
	const rootRef = useRef<HTMLSpanElement>(null)

	useEffect(() => {
		if (!open) return
		function onDocClick(e: MouseEvent) {
			if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
		}
		function onKey(e: KeyboardEvent) {
			if (e.key === 'Escape') setOpen(false)
		}
		document.addEventListener('mousedown', onDocClick)
		document.addEventListener('keydown', onKey)
		return () => {
			document.removeEventListener('mousedown', onDocClick)
			document.removeEventListener('keydown', onKey)
		}
	}, [open])

	async function handleConfirm() {
		setBusy(true)
		try {
			await onConfirm()
			setOpen(false)
		} finally {
			setBusy(false)
		}
	}

	const trigger = isValidElement<{ onClick?: (e: React.MouseEvent) => void }>(children)
		? cloneElement(children, {
				onClick: (e: React.MouseEvent) => {
					e.preventDefault()
					setOpen((o) => !o)
				},
			})
		: children

	return (
		<span ref={rootRef} className="relative inline-block">
			{trigger}
			{open && (
				<div
					role="dialog"
					className="absolute left-1/2 z-30 mt-2 w-64 -translate-x-1/2 rounded-md border border-slate-200 bg-white p-3 shadow-lg anim-slide-in-down origin-top"
				>
					<div className="text-sm font-medium text-slate-900">{title}</div>
					{description && (
						<div className="mt-1 text-xs text-slate-500">{description}</div>
					)}
					<div className="mt-3 flex justify-end gap-2">
						<Button size="sm" onClick={() => setOpen(false)} disabled={busy}>
							{cancelText}
						</Button>
						<Button
							size="sm"
							variant={danger ? 'danger' : 'primary'}
							onClick={handleConfirm}
							loading={busy}
						>
							{confirmText}
						</Button>
					</div>
				</div>
			)}
		</span>
	)
}
