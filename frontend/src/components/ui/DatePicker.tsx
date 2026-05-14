import dayjs from 'dayjs'
import { useEffect, useRef, useState } from 'react'
import { DayPicker, type DateRange } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { cn } from '../../lib/cn'
import { CalendarIcon, CloseIcon } from './Icons'

const FORMAT = 'YYYY-MM-DD'

function format(d?: Date) {
	return d ? dayjs(d).format(FORMAT) : ''
}

interface DatePickerProps {
	value?: Date
	onChange?: (next: Date | undefined) => void
	placeholder?: string
	disabled?: boolean
	invalid?: boolean
	className?: string
}

export function DatePicker({
	value,
	onChange,
	placeholder = FORMAT,
	disabled,
	invalid,
	className,
}: DatePickerProps) {
	const [open, setOpen] = useState(false)
	const rootRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!open) return
		function onDocClick(e: MouseEvent) {
			if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
		}
		document.addEventListener('mousedown', onDocClick)
		return () => document.removeEventListener('mousedown', onDocClick)
	}, [open])

	return (
		<div ref={rootRef} className={cn('relative', className)}>
			<button
				type="button"
				disabled={disabled}
				onClick={() => !disabled && setOpen((o) => !o)}
				className={cn(
					'flex h-10 w-full items-center justify-between gap-2 rounded-md border bg-white px-3 text-sm transition-colors',
					'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
					invalid
						? 'border-red-400 focus-visible:border-red-500'
						: 'border-slate-300 hover:border-slate-400 focus-visible:border-blue-500',
					disabled && 'opacity-50 cursor-not-allowed bg-slate-50',
				)}
			>
				<span className={cn(value ? 'text-slate-900' : 'text-slate-400')}>
					{value ? format(value) : placeholder}
				</span>
				<span className="flex items-center gap-1 text-slate-400">
					{value && !disabled && (
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation()
								onChange?.(undefined)
							}}
							aria-label="Clear date"
							className="rounded p-0.5 hover:bg-slate-100 hover:text-slate-700"
						>
							<CloseIcon width={14} height={14} />
						</button>
					)}
					<CalendarIcon width={16} height={16} />
				</span>
			</button>
			{open && (
				<div className="absolute z-30 mt-1 rounded-md border border-slate-200 bg-white p-2 shadow-lg anim-slide-in-down origin-top">
					<DayPicker
						mode="single"
						selected={value}
						onSelect={(d) => {
							onChange?.(d ?? undefined)
							if (d) setOpen(false)
						}}
						captionLayout="dropdown"
						className="text-sm"
					/>
				</div>
			)}
		</div>
	)
}

interface DateRangePickerProps {
	value?: DateRange
	onChange?: (next: DateRange | undefined) => void
	placeholders?: [string, string]
	disabled?: boolean
	className?: string
}

export function DateRangePicker({
	value,
	onChange,
	placeholders = ['From date', 'To date'],
	disabled,
	className,
}: DateRangePickerProps) {
	const [open, setOpen] = useState(false)
	const rootRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!open) return
		function onDocClick(e: MouseEvent) {
			if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
		}
		document.addEventListener('mousedown', onDocClick)
		return () => document.removeEventListener('mousedown', onDocClick)
	}, [open])

	const hasValue = Boolean(value?.from || value?.to)

	return (
		<div ref={rootRef} className={cn('relative', className)}>
			<button
				type="button"
				disabled={disabled}
				onClick={() => !disabled && setOpen((o) => !o)}
				className={cn(
					'flex h-10 w-full items-center justify-between gap-2 rounded-md border bg-white px-3 text-sm transition-colors',
					'border-slate-300 hover:border-slate-400',
					'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:border-blue-500',
					disabled && 'opacity-50 cursor-not-allowed bg-slate-50',
				)}
			>
				<span className="flex items-center gap-2 truncate">
					<span className={cn(value?.from ? 'text-slate-900' : 'text-slate-400')}>
						{value?.from ? format(value.from) : placeholders[0]}
					</span>
					<span className="text-slate-400">→</span>
					<span className={cn(value?.to ? 'text-slate-900' : 'text-slate-400')}>
						{value?.to ? format(value.to) : placeholders[1]}
					</span>
				</span>
				<span className="flex items-center gap-1 text-slate-400">
					{hasValue && !disabled && (
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation()
								onChange?.(undefined)
							}}
							aria-label="Clear range"
							className="rounded p-0.5 hover:bg-slate-100 hover:text-slate-700"
						>
							<CloseIcon width={14} height={14} />
						</button>
					)}
					<CalendarIcon width={16} height={16} />
				</span>
			</button>
			{open && (
				<div className="absolute z-30 mt-1 rounded-md border border-slate-200 bg-white p-2 shadow-lg anim-slide-in-down origin-top">
					<DayPicker
						mode="range"
						selected={value}
						onSelect={(range) => onChange?.(range)}
						captionLayout="dropdown"
						numberOfMonths={2}
						className="text-sm"
					/>
				</div>
			)}
		</div>
	)
}
