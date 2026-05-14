/* eslint-disable react-refresh/only-export-components --
 * ToastProvider and useToast are a Context provider / consumer pair that
 * are idiomatic to ship together. Splitting them across files for HMR
 * isn't worth the indirection.
 */
import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../lib/cn'
import {
	AlertTriangleIcon,
	CheckCircleIcon,
	CloseIcon,
	InfoIcon,
	XCircleIcon,
} from './Icons'

type Tone = 'info' | 'success' | 'warning' | 'error'

interface Toast {
	id: number
	tone: Tone
	title: string
	description?: ReactNode
}

interface ToastContextValue {
	push: (toast: Omit<Toast, 'id'>) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const toneStyles: Record<Tone, { ring: string; icon: ReactNode }> = {
	info:    { ring: 'border-l-blue-500',    icon: <InfoIcon className="text-blue-600" /> },
	success: { ring: 'border-l-emerald-500', icon: <CheckCircleIcon className="text-emerald-600" /> },
	warning: { ring: 'border-l-amber-500',   icon: <AlertTriangleIcon className="text-amber-600" /> },
	error:   { ring: 'border-l-red-500',     icon: <XCircleIcon className="text-red-600" /> },
}

export function ToastProvider({ children }: { children: ReactNode }) {
	const [toasts, setToasts] = useState<Toast[]>([])
	const idRef = useRef(0)

	const dismiss = useCallback((id: number) => {
		setToasts((t) => t.filter((x) => x.id !== id))
	}, [])

	const push = useCallback((toast: Omit<Toast, 'id'>) => {
		const id = ++idRef.current
		setToasts((t) => [...t, { ...toast, id }])
		// Auto-dismiss after 4s. Errors stick around a bit longer.
		const ttl = toast.tone === 'error' ? 6000 : 4000
		window.setTimeout(() => dismiss(id), ttl)
	}, [dismiss])

	const value = useMemo<ToastContextValue>(() => ({ push }), [push])

	return (
		<ToastContext.Provider value={value}>
			{children}
			{createPortal(
				<div
					aria-live="polite"
					aria-atomic="true"
					className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6"
				>
					{toasts.map((t) => (
						<ToastCard key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
					))}
				</div>,
				document.body,
			)}
		</ToastContext.Provider>
	)
}

function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
	const styles = toneStyles[toast.tone]
	return (
		<div
			role="status"
			className={cn(
				'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-md border border-slate-200 border-l-4 bg-white px-4 py-3 shadow-lg anim-slide-in-top',
				styles.ring,
			)}
		>
			<div className="mt-0.5 flex-shrink-0">{styles.icon}</div>
			<div className="flex-1 text-sm">
				<div className="font-medium text-slate-900">{toast.title}</div>
				{toast.description && (
					<div className="mt-0.5 text-slate-600">{toast.description}</div>
				)}
			</div>
			<button
				type="button"
				onClick={onDismiss}
				aria-label="Dismiss"
				className="-mr-1 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
			>
				<CloseIcon width={14} height={14} />
			</button>
		</div>
	)
}

export function useToast() {
	const ctx = useContext(ToastContext)
	if (!ctx) throw new Error('useToast must be used inside <ToastProvider>.')
	return ctx.push
}
