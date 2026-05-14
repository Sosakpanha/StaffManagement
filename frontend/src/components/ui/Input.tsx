import { type ComponentProps, type ReactNode, forwardRef, useState } from 'react'
import { cn } from '../../lib/cn'

type InputSize = 'sm' | 'md' | 'lg'

type InputProps = Omit<ComponentProps<'input'>, 'size' | 'prefix'> & {
	inputSize?: InputSize
	leading?: ReactNode
	trailing?: ReactNode
	invalid?: boolean
}

const wrapperBase =
	'flex items-center gap-2 rounded-md border bg-white transition-colors ' +
	'focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500'

const sizes: Record<InputSize, string> = {
	sm: 'h-8 px-2 text-sm',
	md: 'h-10 px-3 text-sm',
	lg: 'h-12 px-4 text-base',
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
	{ inputSize = 'md', leading, trailing, invalid, className, disabled, ...props },
	ref,
) {
	return (
		<div
			className={cn(
				wrapperBase,
				sizes[inputSize],
				invalid
					? 'border-red-400 focus-within:border-red-500 focus-within:ring-red-500/40'
					: 'border-slate-300 hover:border-slate-400',
				disabled && 'opacity-50 cursor-not-allowed bg-slate-50',
				className,
			)}
		>
			{leading && <span className="text-slate-400">{leading}</span>}
			<input
				ref={ref}
				disabled={disabled}
				aria-invalid={invalid || undefined}
				className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 outline-none disabled:cursor-not-allowed"
				{...props}
			/>
			{trailing && <span className="text-slate-400">{trailing}</span>}
		</div>
	)
})

type PasswordProps = Omit<InputProps, 'type'>

export const PasswordInput = forwardRef<HTMLInputElement, PasswordProps>(function PasswordInput(
	{ trailing, ...props },
	ref,
) {
	const [visible, setVisible] = useState(false)
	return (
		<Input
			ref={ref}
			type={visible ? 'text' : 'password'}
			trailing={
				<button
					type="button"
					onClick={() => setVisible((v) => !v)}
					className="text-xs text-slate-500 hover:text-slate-700"
				>
					{visible ? 'Hide' : 'Show'}
				</button>
			}
			{...props}
		/>
	)
})
