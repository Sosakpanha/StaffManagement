import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Table, type TableColumn } from './Table'

interface Row {
	id: string
	name: string
	age: number
}

const rows: Row[] = [
	{ id: '1', name: 'Alice', age: 30 },
	{ id: '2', name: 'Bob', age: 25 },
]

const columns: TableColumn<Row>[] = [
	{ key: 'name', title: 'Name', dataIndex: 'name', sortable: true },
	{ key: 'age', title: 'Age', dataIndex: 'age' },
]

describe('Table', () => {
	it('renders headers and rows', () => {
		render(<Table<Row> columns={columns} dataSource={rows} rowKey={(r) => r.id} />)
		expect(screen.getByText('Name')).toBeInTheDocument()
		expect(screen.getByText('Age')).toBeInTheDocument()
		expect(screen.getByText('Alice')).toBeInTheDocument()
		expect(screen.getByText('Bob')).toBeInTheDocument()
		expect(screen.getByText('30')).toBeInTheDocument()
	})

	it('shows the empty state when there is no data', () => {
		render(
			<Table<Row>
				columns={columns}
				dataSource={[]}
				rowKey={(r) => r.id}
				empty="Nothing here yet."
			/>,
		)
		expect(screen.getByText('Nothing here yet.')).toBeInTheDocument()
	})

	it('shows the loading state', () => {
		render(
			<Table<Row>
				columns={columns}
				dataSource={[]}
				rowKey={(r) => r.id}
				loading
			/>,
		)
		expect(screen.getByText('Loading…')).toBeInTheDocument()
	})

	it('toggles sort direction when a sortable header is clicked', async () => {
		const onSortChange = vi.fn()
		render(
			<Table<Row>
				columns={columns}
				dataSource={rows}
				rowKey={(r) => r.id}
				sortBy="name"
				sortDir="asc"
				onSortChange={onSortChange}
			/>,
		)
		await userEvent.click(screen.getByRole('button', { name: /Name/i }))
		expect(onSortChange).toHaveBeenCalledWith('name', 'desc')
	})

	it('renders pagination and exposes Prev/Next', async () => {
		const onPageChange = vi.fn()
		render(
			<Table<Row>
				columns={columns}
				dataSource={rows}
				rowKey={(r) => r.id}
				page={2}
				pageSize={20}
				total={45}
				onPageChange={onPageChange}
			/>,
		)
		expect(screen.getByText('2 / 3')).toBeInTheDocument()
		await userEvent.click(screen.getByRole('button', { name: 'Prev' }))
		expect(onPageChange).toHaveBeenCalledWith(1)
		await userEvent.click(screen.getByRole('button', { name: 'Next' }))
		expect(onPageChange).toHaveBeenCalledWith(3)
	})
})
