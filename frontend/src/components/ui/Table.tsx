import { type ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Button } from './Button'
import { ChevronDownIcon, ChevronUpIcon } from './Icons'

export type SortDir = 'asc' | 'desc'

export interface TableColumn<T> {
	key: string
	title: ReactNode
	dataIndex?: keyof T
	render?: (row: T) => ReactNode
	sortable?: boolean
	width?: number | string
	align?: 'left' | 'center' | 'right'
}

interface TableProps<T> {
	columns: TableColumn<T>[]
	dataSource: T[]
	rowKey: (row: T) => string | number
	loading?: boolean
	empty?: ReactNode
	sortBy?: string
	sortDir?: SortDir
	onSortChange?: (key: string, dir: SortDir) => void
	// Pagination
	page?: number
	pageSize?: number
	total?: number
	onPageChange?: (page: number) => void
	onPageSizeChange?: (size: number) => void
}

export function Table<T>({
	columns,
	dataSource,
	rowKey,
	loading,
	empty = 'No data',
	sortBy,
	sortDir,
	onSortChange,
	page,
	pageSize,
	total,
	onPageChange,
	onPageSizeChange,
}: TableProps<T>) {
	function clickHeader(col: TableColumn<T>) {
		if (!col.sortable || !onSortChange) return
		const next: SortDir =
			sortBy === col.key && sortDir === 'asc' ? 'desc' : 'asc'
		onSortChange(col.key, next)
	}

	const showPagination =
		typeof page === 'number' && typeof pageSize === 'number' && typeof total === 'number'

	return (
		<div className="overflow-hidden rounded-md border border-slate-200">
			<div className="relative overflow-auto">
				<table className="min-w-full text-sm">
					<thead className="bg-slate-50">
						<tr>
							{columns.map((col) => {
								const isSorted = sortBy === col.key
								return (
									<th
										key={col.key}
										scope="col"
										style={{ width: col.width }}
										className={cn(
											'border-b border-slate-200 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-600',
											col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
										)}
									>
										{col.sortable ? (
											<button
												type="button"
												onClick={() => clickHeader(col)}
												className="inline-flex items-center gap-1 hover:text-slate-900"
											>
												{col.title}
												<span className="flex flex-col">
													<ChevronUpIcon
														width={10}
														height={10}
														className={cn(isSorted && sortDir === 'asc' ? 'text-slate-900' : 'text-slate-300')}
													/>
													<ChevronDownIcon
														width={10}
														height={10}
														className={cn('-mt-0.5', isSorted && sortDir === 'desc' ? 'text-slate-900' : 'text-slate-300')}
													/>
												</span>
											</button>
										) : (
											col.title
										)}
									</th>
								)
							})}
						</tr>
					</thead>
					<tbody>
						{loading && (
							<tr>
								<td colSpan={columns.length} className="px-4 py-8 text-center text-slate-400">
									Loading…
								</td>
							</tr>
						)}
						{!loading && dataSource.length === 0 && (
							<tr>
								<td colSpan={columns.length} className="px-4 py-8 text-center text-slate-400">
									{empty}
								</td>
							</tr>
						)}
						{!loading &&
							dataSource.map((row) => (
								<tr
									key={rowKey(row)}
									className="border-b border-slate-100 last:border-b-0 transition-colors duration-150 hover:bg-slate-50"
								>
									{columns.map((col) => (
										<td
											key={col.key}
											className={cn(
												'px-4 py-2.5 text-slate-700',
												col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
											)}
										>
											{col.render
												? col.render(row)
												: col.dataIndex
													? String(row[col.dataIndex] ?? '')
													: null}
										</td>
									))}
								</tr>
							))}
					</tbody>
				</table>
			</div>
			{showPagination && (
				<Pagination
					page={page}
					pageSize={pageSize}
					total={total}
					onPageChange={onPageChange}
					onPageSizeChange={onPageSizeChange}
				/>
			)}
		</div>
	)
}

interface PaginationProps {
	page: number
	pageSize: number
	total: number
	onPageChange?: (page: number) => void
	onPageSizeChange?: (size: number) => void
}

function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange }: PaginationProps) {
	const totalPages = Math.max(1, Math.ceil(total / pageSize))
	const start = total === 0 ? 0 : (page - 1) * pageSize + 1
	const end = Math.min(total, page * pageSize)
	return (
		<div className="flex items-center justify-between gap-4 border-t border-slate-200 bg-white px-4 py-2.5 text-sm">
			<div className="text-slate-500">
				{total === 0 ? 'No results' : <>Showing <span className="font-medium text-slate-700">{start}–{end}</span> of <span className="font-medium text-slate-700">{total}</span></>}
			</div>
			<div className="flex items-center gap-2">
				{onPageSizeChange && (
					<select
						value={pageSize}
						onChange={(e) => onPageSizeChange(Number(e.target.value))}
						className="h-8 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
					>
						{[10, 20, 50, 100].map((n) => (
							<option key={n} value={n}>
								{n} / page
							</option>
						))}
					</select>
				)}
				<Button
					size="sm"
					onClick={() => onPageChange?.(page - 1)}
					disabled={page <= 1}
				>
					Prev
				</Button>
				<span className="px-2 text-slate-600">
					{page} / {totalPages}
				</span>
				<Button
					size="sm"
					onClick={() => onPageChange?.(page + 1)}
					disabled={page >= totalPages}
				>
					Next
				</Button>
			</div>
		</div>
	)
}
