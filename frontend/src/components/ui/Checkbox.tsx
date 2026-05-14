import { type ReactNode, forwardRef, type ComponentProps } from 'react'
import { cn } from '../../lib/cn'
import { CheckIcon } from './Icons'

type CheckboxProps = Omit<ComponentProps<'input'>, 'type'> & {
	label?: ReactNode
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
	{ label, checked, disabled, className, ...props },
	ref,
) {
	return (
		<label
			className={cn(
				'inline-flex items-center gap-2 text-sm text-slate-700 select-none',
				disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
				className,
			)}
		>
			<span className="relative inline-flex h-4 w-4 items-center justify-center">
				<input
					ref={ref}
					type="checkbox"
					checked={checked}
					disabled={disabled}
					className="peer absolute h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 bg-white checked:border-blue-600 checked:bg-blue-600 hover:border-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:cursor-not-allowed"
					{...props}
				/>
				<CheckIcon
					width={12}
					height={12}
					className="pointer-events-none invisible text-white peer-checked:visible"
				/>
			</span>
			{label}
		</label>
	)
})
