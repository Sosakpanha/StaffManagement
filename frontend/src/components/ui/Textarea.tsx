import { type ComponentProps, forwardRef } from 'react'
import { cn } from '../../lib/cn'

type TextareaProps = ComponentProps<'textarea'> & { invalid?: boolean }

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
	{ invalid, className, disabled, ...props },
	ref,
) {
	return (
		<textarea
			ref={ref}
			disabled={disabled}
			aria-invalid={invalid || undefined}
			className={cn(
				'min-h-[88px] w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 transition-colors',
				'placeholder:text-slate-400 outline-none',
				'focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500',
				invalid
					? 'border-red-400 focus:border-red-500 focus:ring-red-500/40'
					: 'border-slate-300 hover:border-slate-400',
				disabled && 'opacity-50 cursor-not-allowed bg-slate-50',
				className,
			)}
			{...props}
		/>
	)
})
