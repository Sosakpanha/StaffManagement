import type { SVGProps } from 'react'

const baseProps: SVGProps<SVGSVGElement> = {
	xmlns: 'http://www.w3.org/2000/svg',
	width: 16,
	height: 16,
	viewBox: '0 0 24 24',
	fill: 'none',
	stroke: 'currentColor',
	strokeWidth: 2,
	strokeLinecap: 'round',
	strokeLinejoin: 'round',
}

type IconProps = SVGProps<SVGSVGElement>

export const SearchIcon = (p: IconProps) => (
	<svg {...baseProps} {...p}>
		<circle cx={11} cy={11} r={8} />
		<path d="m21 21-4.3-4.3" />
	</svg>
)

export const PlusIcon = (p: IconProps) => (
	<svg {...baseProps} {...p}>
		<path d="M5 12h14M12 5v14" />
	</svg>
)

export const CloseIcon = (p: IconProps) => (
	<svg {...baseProps} {...p}>
		<path d="M18 6 6 18M6 6l12 12" />
	</svg>
)

export const ChevronDownIcon = (p: IconProps) => (
	<svg {...baseProps} {...p}>
		<path d="m6 9 6 6 6-6" />
	</svg>
)

export const ChevronUpIcon = (p: IconProps) => (
	<svg {...baseProps} {...p}>
		<path d="m18 15-6-6-6 6" />
	</svg>
)

export const CalendarIcon = (p: IconProps) => (
	<svg {...baseProps} {...p}>
		<rect width={18} height={18} x={3} y={4} rx={2} />
		<path d="M16 2v4M8 2v4M3 10h18" />
	</svg>
)

export const DownloadIcon = (p: IconProps) => (
	<svg {...baseProps} {...p}>
		<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
	</svg>
)

export const TrashIcon = (p: IconProps) => (
	<svg {...baseProps} {...p}>
		<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
	</svg>
)

export const PencilIcon = (p: IconProps) => (
	<svg {...baseProps} {...p}>
		<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
	</svg>
)

export const InfoIcon = (p: IconProps) => (
	<svg {...baseProps} {...p}>
		<circle cx={12} cy={12} r={10} />
		<path d="M12 16v-4M12 8h.01" />
	</svg>
)

export const CheckCircleIcon = (p: IconProps) => (
	<svg {...baseProps} {...p}>
		<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
		<path d="m9 11 3 3L22 4" />
	</svg>
)

export const AlertTriangleIcon = (p: IconProps) => (
	<svg {...baseProps} {...p}>
		<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3M12 9v4M12 17h.01" />
	</svg>
)

export const XCircleIcon = (p: IconProps) => (
	<svg {...baseProps} {...p}>
		<circle cx={12} cy={12} r={10} />
		<path d="m15 9-6 6M9 9l6 6" />
	</svg>
)

export const CheckIcon = (p: IconProps) => (
	<svg {...baseProps} {...p}>
		<path d="M20 6 9 17l-5-5" />
	</svg>
)
