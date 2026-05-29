import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/cars', label: 'Cars' },
    { to: '/services', label: 'Services' },
    { to: '/service-records', label: 'Service Records' },
    { to: '/payments', label: 'Payments' },
    { to: '/reports', label: 'Reports' },
];

export default function Layout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Navbar */}
            <nav className="bg-green-800 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-2 text-xl font-bold tracking-wide">
                            <span className="bg-white rounded-lg p-1">
                                <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                                </svg>
                            </span>
                            SmartPark CRPMS
                        </span>
                    </div>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    `px-3 py-2 rounded text-sm font-medium transition-colors ${isActive ? 'bg-green-600' : 'hover:bg-green-700'
                                    }`
                                }
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        <span className="inline-flex items-center gap-1 text-sm text-green-200">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {user?.username}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1.5 rounded transition-colors"
                        >
                            Logout
                        </button>
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        className="md:hidden text-white focus:outline-none"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {menuOpen
                                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
                        </svg>
                    </button>
                </div>

                {/* Mobile menu */}
                {menuOpen && (
                    <div className="md:hidden px-4 pb-3 flex flex-col gap-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={() => setMenuOpen(false)}
                                className={({ isActive }) =>
                                    `px-3 py-2 rounded text-sm font-medium ${isActive ? 'bg-green-600' : 'hover:bg-green-700'}`
                                }
                            >
                                {item.label}
                            </NavLink>
                        ))}
                        <button
                            onClick={handleLogout}
                            className="mt-2 bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-2 rounded text-left"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </nav>

            {/* Page content */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
                {children}
            </main>

            <footer className="bg-green-800 text-green-200 text-center text-xs py-3">
                © 2026 SmartPark CRPMS — Rubavu District, Western Province, Rwanda
            </footer>
        </div>
    );
}
