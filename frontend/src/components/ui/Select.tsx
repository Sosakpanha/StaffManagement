import { useEffect, useId, useRef, useState } from 'react'
import { cn } from '../../lib/cn'
import { ChevronDownIcon, CloseIcon } from './Icons'

export interface SelectOption<T extends string | number> {
	value: T
	label: string
	disabled?: boolean
}

interface SelectProps<T extends string | number> {
	value?: T
	onChange?: (next: T | undefined) => void
	options: SelectOption<T>[]
	placeholder?: string
	allowClear?: boolean
	disabled?: boolean
	invalid?: boolean
	className?: string
}

export function Select<T extends string | number>({
	value,
	onChange,
	options,
	placeholder = 'Select…',
	allowClear,
	disabled,
	invalid,
	className,
}: SelectProps<T>) {
	const [open, setOpen] = useState(false)
	const [activeIndex, setActiveIndex] = useState(-1)
	const rootRef = useRef<HTMLDivElement>(null)
	const listboxId = useId()

	const current = options.find((o) => o.value === value)

	// Close on outside click.
	useEffect(() => {
		if (!open) return
		function onDocClick(e: MouseEvent) {
			if (!rootRef.current?.contains(e.target as Node)) {
				setOpen(false)
			}
		}
		document.addEventListener('mousedown', onDocClick)
		return () => document.removeEventListener('mousedown', onDocClick)
	}, [open])

	function commit(opt: SelectOption<T>) {
		if (opt.disabled) return
		onChange?.(opt.value)
		setOpen(false)
	}

	function handleKey(e: React.KeyboardEvent) {
		if (disabled) return
		if (!open && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
			e.preventDefault()
			setOpen(true)
			setActiveIndex(Math.max(0, options.findIndex((o) => o.value === value)))
			return
		}
		if (!open) return
		if (e.key === 'Escape') {
			setOpen(false)
			return
		}
		if (e.key === 'ArrowDown') {
			e.preventDefault()
			setActiveIndex((i) => Math.min(options.length - 1, i + 1))
		} else if (e.key === 'ArrowUp') {
			e.preventDefault()
			setActiveIndex((i) => Math.max(0, i - 1))
		} else if (e.key === 'Enter') {
			e.preventDefault()
			const opt = options[activeIndex]
			if (opt) commit(opt)
		}
	}

	return (
		<div ref={rootRef} className={cn('relative', className)}>
			<button
				type="button"
				disabled={disabled}
				aria-haspopup="listbox"
				aria-expanded={open}
				aria-controls={listboxId}
				onClick={() => !disabled && setOpen((o) => !o)}
				onKeyDown={handleKey}
				className={cn(
					'flex h-10 w-full items-center justify-between gap-2 rounded-md border bg-white px-3 text-sm text-left transition-colors',
					'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
					invalid
						? 'border-red-400 focus-visible:border-red-500'
						: 'border-slate-300 hover:border-slate-400 focus-visible:border-blue-500',
					disabled && 'opacity-50 cursor-not-allowed bg-slate-50',
				)}
			>
				<span className={cn('truncate', !current && 'text-slate-400')}>
					{current ? current.label : placeholder}
				</span>
				<span className="flex items-center gap-1 text-slate-400">
					{allowClear && current && !disabled && (
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation()
								onChange?.(undefined)
							}}
							aria-label="Clear selection"
							className="rounded p-0.5 hover:bg-slate-100 hover:text-slate-700"
						>
							<CloseIcon width={14} height={14} />
						</button>
					)}
					<ChevronDownIcon
						width={16}
						height={16}
						className={cn('transition-transform', open && 'rotate-180')}
					/>
				</span>
			</button>
			{open && (
				<ul
					id={listboxId}
					role="listbox"
					className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg anim-slide-in-down origin-top"
				>
					{options.map((opt, i) => {
						const selected = opt.value === value
						const active = i === activeIndex
						return (
							<li
								key={String(opt.value)}
								role="option"
								aria-selected={selected}
								aria-disabled={opt.disabled}
								onMouseEnter={() => setActiveIndex(i)}
								onMouseDown={(e) => {
									// Use mousedown so click-outside doesn't fire first.
									e.preventDefault()
									commit(opt)
								}}
								className={cn(
									'flex cursor-pointer items-center justify-between px-3 py-1.5 text-sm',
									opt.disabled
										? 'text-slate-400 cursor-not-allowed'
										: active
											? 'bg-blue-50 text-blue-700'
											: 'text-slate-700 hover:bg-slate-50',
									selected && !opt.disabled && 'font-medium text-blue-700',
								)}
							>
								<span className="truncate">{opt.label}</span>
								{selected && <span className="text-blue-600">✓</span>}
							</li>
						)
					})}
					{options.length === 0 && (
						<li className="px-3 py-2 text-sm text-slate-400">No options</li>
					)}
				</ul>
			)}
		</div>
	)
}
