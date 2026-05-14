import { useEffect, useState } from 'react'
import { type DateRange } from 'react-day-picker'
import { useNavigate } from 'react-router-dom'
import { ApiException } from '../api/client'
import { buildExportUrl, deleteStaff, searchStaff } from '../api/staff'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { DateRangePicker } from '../components/ui/DatePicker'
import { Drawer } from '../components/ui/Drawer'
import { Field } from '../components/ui/Field'
import {
	DownloadIcon,
	PencilIcon,
	PlusIcon,
	SearchIcon,
	TrashIcon,
} from '../components/ui/Icons'
import { Input } from '../components/ui/Input'
import { ConfirmModal } from '../components/ui/Modal'
import { Select } from '../components/ui/Select'
import { Table, type SortDir, type TableColumn } from '../components/ui/Table'
import { Tag } from '../components/ui/Tag'
import { useToast } from '../components/ui/Toast'
import type { StaffResponse, StaffSearchRequest } from '../types/staff'
import { toIsoDate } from '../utils/dates'

const DEFAULT_SEARCH: StaffSearchRequest = {
	page: 1,
	pageSize: 20,
	sortBy: 'FullName',
	sortDir: 'asc',
}

const GENDER_OPTIONS = [
	{ value: 1, label: 'Male' },
	{ value: 2, label: 'Female' },
] as const

function GenderTag({ value }: { value: 1 | 2 }) {
	return (
		<Tag tone={value === 1 ? 'blue' : 'magenta'}>
			{value === 1 ? 'Male' : 'Female'}
		</Tag>
	)
}

export function StaffListPage() {
	const navigate = useNavigate()
	const pushToast = useToast()

	const [search, setSearch] = useState<StaffSearchRequest>(DEFAULT_SEARCH)
	const [quickName, setQuickName] = useState('')

	const [rows, setRows] = useState<StaffResponse[]>([])
	const [total, setTotal] = useState(0)
	const [loading, setLoading] = useState(false)
	const [loadError, setLoadError] = useState<string | null>(null)

	const [drawerOpen, setDrawerOpen] = useState(false)
	const [drawerStaffId, setDrawerStaffId] = useState('')
	const [drawerGender, setDrawerGender] = useState<1 | 2 | undefined>(undefined)
	const [drawerRange, setDrawerRange] = useState<DateRange | undefined>(undefined)

	const [toDelete, setToDelete] = useState<StaffResponse | null>(null)
	const [deleting, setDeleting] = useState(false)
	const [deleteError, setDeleteError] = useState<string | null>(null)

	useEffect(() => {
		let cancelled = false
		setLoading(true)
		setLoadError(null)
		searchStaff(search)
			.then((page) => {
				if (cancelled) return
				setRows(page.items)
				setTotal(page.totalCount)
			})
			.catch((err: unknown) => {
				if (cancelled) return
				const msg =
					err instanceof ApiException ? err.message : 'Failed to load staff.'
				setLoadError(msg)
				setRows([])
				setTotal(0)
			})
			.finally(() => {
				if (!cancelled) setLoading(false)
			})
		return () => {
			cancelled = true
		}
	}, [search])

	function applyQuickSearch() {
		setSearch((prev) => ({
			...prev,
			fullName: quickName.trim() || undefined,
			page: 1,
		}))
	}

	function clearQuickSearch() {
		setQuickName('')
		setSearch((prev) => ({ ...prev, fullName: undefined, page: 1 }))
	}

	function openDrawer() {
		setDrawerStaffId(search.staffId ?? '')
		setDrawerGender(search.gender)
		setDrawerRange(
			search.birthdayFrom || search.birthdayTo
				? {
					from: search.birthdayFrom
						? new Date(search.birthdayFrom)
						: undefined,
					to: search.birthdayTo ? new Date(search.birthdayTo) : undefined,
				}
				: undefined,
		)
		setDrawerOpen(true)
	}

	function applyAdvancedSearch() {
		setSearch((prev) => ({
			...prev,
			staffId: drawerStaffId.trim() || undefined,
			gender: drawerGender,
			birthdayFrom: toIsoDate(drawerRange?.from),
			birthdayTo: toIsoDate(drawerRange?.to),
			page: 1,
		}))
		setDrawerOpen(false)
	}

	function resetAdvancedSearch() {
		setDrawerStaffId('')
		setDrawerGender(undefined)
		setDrawerRange(undefined)
		setSearch((prev) => ({
			...prev,
			staffId: undefined,
			gender: undefined,
			birthdayFrom: undefined,
			birthdayTo: undefined,
			page: 1,
		}))
		setDrawerOpen(false)
	}

	function onSortChange(key: string, dir: SortDir) {
		setSearch((prev) => ({ ...prev, sortBy: key, sortDir: dir, page: 1 }))
	}

	function onPageChange(page: number) {
		setSearch((prev) => ({ ...prev, page }))
	}

	function onPageSizeChange(pageSize: number) {
		setSearch((prev) => ({ ...prev, pageSize, page: 1 }))
	}

	async function confirmDelete() {
		if (!toDelete) return
		setDeleting(true)
		setDeleteError(null)
		try {
			const deleted = await deleteStaff(toDelete.id)
			setToDelete(null)
			setSearch((prev) => ({ ...prev })) // re-trigger the effect
			pushToast({
				tone: 'success',
				title: 'Staff deleted',
				description: `${deleted.fullName} (${deleted.staffId}) has been deleted.`,
			})
		} catch (err) {
			const msg = err instanceof ApiException ? err.message : 'Delete failed.'
			setDeleteError(msg)
		} finally {
			setDeleting(false)
		}
	}

	function download(kind: 'excel' | 'pdf') {
		// Use the same filter set (minus paging) so the server returns the
		// full filtered result. window.open avoids the SPA router intercepting.
		const { page: _p, pageSize: _ps, ...filters } = search
		void _p
		void _ps
		window.open(buildExportUrl(kind, filters), '_blank')
	}

	const activeFilters: string[] = []
	if (search.staffId) activeFilters.push(`StaffId: ${search.staffId}`)
	if (search.gender) activeFilters.push(`Gender: ${search.gender === 1 ? 'Male' : 'Female'}`)
	if (search.birthdayFrom) activeFilters.push(`From: ${search.birthdayFrom}`)
	if (search.birthdayTo) activeFilters.push(`To: ${search.birthdayTo}`)

	const columns: TableColumn<StaffResponse>[] = [
		{
			key: 'StaffId',
			title: 'Staff ID',
			dataIndex: 'staffId',
			sortable: true,
			width: 140,
		},
		{
			key: 'FullName',
			title: 'Full Name',
			dataIndex: 'fullName',
			sortable: true,
		},
		{
			key: 'Birthday',
			title: 'Birthday',
			dataIndex: 'birthday',
			sortable: true,
			width: 140,
		},
		{
			key: 'Gender',
			title: 'Gender',
			sortable: true,
			width: 120,
			render: (row) => <GenderTag value={row.gender} />,
		},
		{
			key: 'actions',
			title: 'Actions',
			align: 'right',
			width: 200,
			render: (row) => (
				<div className="flex items-center justify-end gap-2">
					<Button
						size="sm"
						variant="secondary"
						onClick={() => navigate(`/staff/${row.id}`)}
					>
						<PencilIcon /> Edit
					</Button>
					<Button
						size="sm"
						variant="danger"
						onClick={() => setToDelete(row)}
					>
						<TrashIcon /> Delete
					</Button>
				</div>
			),
		},
	]

	return (
		<div className="space-y-4">
			<Card
				title="Staff"
				description="Search, add, edit, delete, and export staff."
				actions={
					<div className="flex items-center gap-2">
						<Button variant="ghost" onClick={() => download('excel')} disabled={total === 0}>
							<DownloadIcon /> Excel
						</Button>
						<Button variant="ghost" onClick={() => download('pdf')} disabled={total === 0}>
							<DownloadIcon /> PDF
						</Button>
						<Button variant="primary" onClick={() => navigate('/staff/new')}>
							<PlusIcon /> New staff
						</Button>
					</div>
				}
			>
				<div className="flex flex-wrap items-center gap-2">
					<div className="w-full max-w-sm">
						<Input
							leading={<SearchIcon />}
							placeholder="Search by full name"
							value={quickName}
							onChange={(e) => setQuickName(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter') applyQuickSearch()
							}}
						/>
					</div>
					<Button variant="primary" onClick={applyQuickSearch}>
						Search
					</Button>
					<Button variant="secondary" onClick={openDrawer}>
						Advanced search
					</Button>
					{(search.fullName ||
						search.staffId ||
						search.gender ||
						search.birthdayFrom ||
						search.birthdayTo) && (
						<Button variant="ghost" onClick={() => {
							setQuickName('')
							setSearch(DEFAULT_SEARCH)
						}}>
							Clear all
						</Button>
					)}
				</div>

				{(search.fullName || activeFilters.length > 0) && (
					<div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
						<span className="text-slate-500">Filters:</span>
						{search.fullName && <Tag tone="blue">Name: {search.fullName}</Tag>}
						{activeFilters.map((f) => (
							<Tag key={f}>{f}</Tag>
						))}
						<Button size="sm" variant="ghost" onClick={clearQuickSearch}>
							Clear name
						</Button>
					</div>
				)}

				{loadError && (
					<div className="mt-4">
						<Alert tone="error" title="Couldn't load staff">
							{loadError}
						</Alert>
					</div>
				)}

				<div className="mt-4">
					<Table<StaffResponse>
						columns={columns}
						dataSource={rows}
						rowKey={(r) => r.id}
						loading={loading}
						empty="No staff found. Try widening your search or add a new staff member."
						sortBy={search.sortBy}
						sortDir={search.sortDir}
						onSortChange={onSortChange}
						page={search.page}
						pageSize={search.pageSize}
						total={total}
						onPageChange={onPageChange}
						onPageSizeChange={onPageSizeChange}
					/>
				</div>
			</Card>

			<Drawer
				open={drawerOpen}
				onClose={() => setDrawerOpen(false)}
				title="Advanced search"
				footer={
					<div className="flex items-center justify-end gap-2">
						<Button variant="ghost" onClick={resetAdvancedSearch}>
							Reset
						</Button>
						<Button variant="secondary" onClick={() => setDrawerOpen(false)}>
							Cancel
						</Button>
						<Button variant="primary" onClick={applyAdvancedSearch}>
							Apply
						</Button>
					</div>
				}
			>
				<div className="space-y-4">
					<Field label="Staff ID" htmlFor="adv-staff-id">
						<Input
							id="adv-staff-id"
							maxLength={8}
							placeholder="Exact staff id"
							value={drawerStaffId}
							onChange={(e) => setDrawerStaffId(e.target.value)}
						/>
					</Field>
					<Field label="Gender">
						<Select<number>
							value={drawerGender}
							onChange={(v) => setDrawerGender(v as 1 | 2 | undefined)}
							options={GENDER_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
							allowClear
							placeholder="Any"
						/>
					</Field>
					<Field label="Birthday range">
						<DateRangePicker value={drawerRange} onChange={setDrawerRange} />
					</Field>
				</div>
			</Drawer>

			<ConfirmModal
				open={Boolean(toDelete)}
				onCancel={() => {
					setToDelete(null)
					setDeleteError(null)
				}}
				onConfirm={confirmDelete}
				title="Delete staff?"
				danger
				confirmText="Delete"
				loading={deleting}
				description={
					<>
						<p>
							This will permanently delete{' '}
							<span className="font-medium text-slate-900">
								{toDelete?.fullName} ({toDelete?.staffId})
							</span>
							. This action cannot be undone.
						</p>
						{deleteError && (
							<div className="mt-3">
								<Alert tone="error">{deleteError}</Alert>
							</div>
						)}
					</>
				}
			/>
		</div>
	)
}
