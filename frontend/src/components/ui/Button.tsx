import { type ComponentProps, forwardRef } from 'react'
import { cn } from '../../lib/cn'
import { Spinner } from './Spinner'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'link'
type ButtonSize = 'sm' | 'md' | 'lg'

type ButtonProps = ComponentProps<'button'> & {
	variant?: ButtonVariant
	size?: ButtonSize
	loading?: boolean
}

const base =
	'inline-flex items-center justify-center gap-2 rounded-md font-medium ' +
	'transition-[color,background-color,border-color,box-shadow,transform] duration-150 select-none ' +
	'active:scale-[0.97] motion-reduce:active:scale-100 ' +
	'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ' +
	'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100'

const variants: Record<ButtonVariant, string> = {
	primary:
		'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 ' +
		'focus-visible:ring-blue-500',
	secondary:
		'bg-white text-slate-900 border border-slate-300 hover:bg-slate-50 ' +
		'active:bg-slate-100 focus-visible:ring-blue-500',
	danger:
		'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 ' +
		'focus-visible:ring-red-500',
	ghost:
		'bg-transparent text-slate-700 hover:bg-slate-100 ' +
		'active:bg-slate-200 focus-visible:ring-slate-400',
	link:
		'bg-transparent text-blue-600 hover:underline underline-offset-2 ' +
		'focus-visible:ring-blue-500 px-1',
}

const sizes: Record<ButtonSize, string> = {
	sm: 'h-8 px-3 text-sm',
	md: 'h-10 px-4 text-sm',
	lg: 'h-12 px-6 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
	{ variant = 'secondary', size = 'md', loading, disabled, className, children, ...props },
	ref,
) {
	return (
		<button
			ref={ref}
			disabled={disabled || loading}
			className={cn(base, variants[variant], sizes[size], className)}
			{...props}
		>
			{loading && <Spinner size={size === 'lg' ? 18 : 14} />}
			{children}
		</button>
	)
})
