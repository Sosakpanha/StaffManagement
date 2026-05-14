import { type ReactNode, createContext, useContext, useId } from 'react'
import { cn } from '../../lib/cn'

interface RadioContextValue {
	name: string
	value: string | number | undefined
	onChange: (next: string | number) => void
	disabled: boolean
	segmented: boolean
}

const RadioContext = createContext<RadioContextValue | null>(null)

interface RadioGroupProps<T extends string | number> {
	value?: T
	onChange?: (next: T) => void
	name?: string
	disabled?: boolean
	segmented?: boolean
	children: ReactNode
	className?: string
}

export function RadioGroup<T extends string | number>({
	value,
	onChange,
	name,
	disabled = false,
	segmented = false,
	children,
	className,
}: RadioGroupProps<T>) {
	const autoName = useId()
	return (
		<RadioContext.Provider
			value={{
				name: name ?? autoName,
				value,
				onChange: (next) => onChange?.(next as T),
				disabled,
				segmented,
			}}
		>
			<div
				className={cn(
					segmented
						? 'inline-flex overflow-hidden rounded-md border border-slate-300'
						: 'flex flex-wrap gap-4',
					className,
				)}
			>
				{children}
			</div>
		</RadioContext.Provider>
	)
}

interface RadioProps {
	value: string | number
	children: ReactNode
	disabled?: boolean
	className?: string
}

export function Radio({ value, children, disabled, className }: RadioProps) {
	const ctx = useContext(RadioContext)
	if (!ctx) throw new Error('<Radio> must be used inside <RadioGroup>.')

	const isChecked = ctx.value === value
	const isDisabled = disabled || ctx.disabled

	if (ctx.segmented) {
		return (
			<button
				type="button"
				disabled={isDisabled}
				onClick={() => ctx.onChange(value)}
				className={cn(
					'min-w-[64px] px-3 py-1.5 text-sm transition-colors border-l border-slate-300 first:border-l-0',
					isChecked
						? 'bg-blue-600 text-white hover:bg-blue-700'
						: 'bg-white text-slate-700 hover:bg-slate-50',
					isDisabled && 'opacity-50 cursor-not-allowed',
					className,
				)}
			>
				{children}
			</button>
		)
	}

	return (
		<label
			className={cn(
				'inline-flex items-center gap-2 text-sm text-slate-700 select-none',
				isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
				className,
			)}
		>
			<span className="relative inline-flex h-4 w-4 items-center justify-center">
				<input
					type="radio"
					name={ctx.name}
					value={String(value)}
					checked={isChecked}
					disabled={isDisabled}
					onChange={() => ctx.onChange(value)}
					className="peer h-4 w-4 cursor-pointer appearance-none rounded-full border border-slate-300 bg-white checked:border-blue-600 hover:border-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:cursor-not-allowed"
				/>
				<span className="pointer-events-none absolute h-2 w-2 scale-0 rounded-full bg-blue-600 transition-transform peer-checked:scale-100" />
			</span>
			{children}
		</label>
	)
}
