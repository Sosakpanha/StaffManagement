import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { StaffFormPage } from './pages/StaffFormPage'
import { StaffListPage } from './pages/StaffListPage'

export const router = createBrowserRouter([
	{
		path: '/',
		element: <AppLayout />,
		children: [
			{ index: true, element: <Navigate to="/staff" replace /> },
			{ path: 'staff', element: <StaffListPage /> },
			{ path: 'staff/new', element: <StaffFormPage /> },
			{ path: 'staff/:id', element: <StaffFormPage /> },
		],
	},
])
