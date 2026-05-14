import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { cn } from '../lib/cn'

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
	return (
		<NavLink
			to={to}
			className={({ isActive }) =>
				cn(
					'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
					isActive
						? 'bg-slate-800 text-white'
						: 'text-slate-300 hover:bg-slate-800/60 hover:text-white',
				)
			}
		>
			{children}
		</NavLink>
	)
}

export function AppLayout() {
	const location = useLocation()
	return (
		<div className="flex min-h-screen flex-col bg-slate-50">
			<header className="border-b border-slate-200 bg-slate-900">
				<div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-6">
					<div className="text-base font-semibold tracking-wide text-white">
						Staff Management
					</div>
					<nav className="flex items-center gap-1">
						<NavItem to="/staff">Staff</NavItem>
					</nav>
				</div>
			</header>
			<main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
				<div key={location.pathname} className="anim-slide-in-down">
					<Outlet />
				</div>
			</main>
			<footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
				Staff Management © 2026
			</footer>
		</div>
	)
}
