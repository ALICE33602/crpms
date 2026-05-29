import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const features = [
    {
        title: 'Vehicle Registration',
        desc: 'Register and manage all customer vehicles with detailed specs, plate numbers, and owner information in one centralized system.',
        icon: (
            <svg className="w-10 h-10 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    {
        title: 'Service Management',
        desc: 'Track all repair services from diagnosis to completion. Assign priorities, set deadlines, and monitor progress in real time.',
        icon: (
            <svg className="w-10 h-10 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
    },
    {
        title: 'Mechanic Assignment',
        desc: 'Assign qualified mechanics to specific jobs based on expertise, availability, and workload for optimal workshop efficiency.',
        icon: (
            <svg className="w-10 h-10 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
    },
    {
        title: 'Payment Tracking',
        desc: 'Record and monitor all financial transactions including service fees, parts costs, and outstanding balances with full audit trails.',
        icon: (
            <svg className="w-10 h-10 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    {
        title: 'Service History',
        desc: 'Maintain a complete digital record of every service performed on each vehicle for quick reference and customer transparency.',
        icon: (
            <svg className="w-10 h-10 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
    },
    {
        title: 'Reports Generation',
        desc: 'Generate comprehensive PDF and Excel reports for service bills, daily payments, and operational analytics on demand.',
        icon: (
            <svg className="w-10 h-10 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
    },
];

export default function LandingPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const homeRef = useRef(null);
    const featuresRef = useRef(null);
    const loginRef = useRef(null);

    const [form, setForm] = useState({ username: '', password: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const scrollTo = (ref) => {
        ref.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const validate = () => {
        const e = {};
        const username = form.username.trim();
        if (!username) e.username = 'Username is required';
        else if (!/^[a-zA-Z0-9]+$/.test(username)) e.username = 'Only letters and numbers allowed';
        if (!form.password) e.password = 'Password is required';
        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setLoading(true);
        try {
            await login(form.username.trim(), form.password);
            toast.success('Welcome back!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const set = (field, value) => {
        setForm(f => ({ ...f, [field]: value }));
        setErrors(er => ({ ...er, [field]: '' }));
    };

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navLinks = [
        { label: 'Home', onClick: () => { scrollTo(homeRef); setMobileMenuOpen(false); } },
        { label: 'Features', onClick: () => { scrollTo(featuresRef); setMobileMenuOpen(false); } },
        { label: 'Login', onClick: () => { scrollTo(loginRef); setMobileMenuOpen(false); } },
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-9 h-9 bg-green-800 rounded-lg">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-green-900 tracking-tight">SmartPark <span className="text-green-700">CRPMS</span></span>
                        </div>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-1">
                            {navLinks.map((link) => (
                                <button
                                    key={link.label}
                                    onClick={link.onClick}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-green-50 hover:text-green-800 transition-colors"
                                >
                                    {link.label}
                                </button>
                            ))}
                        </div>

                        {/* Mobile hamburger */}
                        <button
                            className="md:hidden text-green-800 focus:outline-none"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {mobileMenuOpen
                                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
                            </svg>
                        </button>
                    </div>

                    {/* Mobile menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden pb-4 flex flex-col gap-1">
                            {navLinks.map((link) => (
                                <button
                                    key={link.label}
                                    onClick={link.onClick}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-green-50 hover:text-green-800 text-left transition-colors"
                                >
                                    {link.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <section
                ref={homeRef}
                id="home"
                className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 flex items-center pt-16"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-10 py-16 md:py-0">
                        {/* Left */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight">
                                CRPMS
                            </h1>
                            <p className="mt-6 text-lg sm:text-xl text-green-100 max-w-xl leading-relaxed">
                                A centralized digital platform designed to efficiently manage SmartPark car repair operations, service tracking, mechanic assignments, payments, and reporting.
                            </p>
                            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                                <button
                                    onClick={() => scrollTo(loginRef)}
                                    className="bg-white text-green-800 font-bold px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-lg"
                                >
                                    Login To CRPMS
                                </button>
                                <button
                                    onClick={() => scrollTo(featuresRef)}
                                    className="text-white border-2 border-white/40 hover:border-white font-semibold px-8 py-3.5 rounded-full transition-all duration-300 text-lg"
                                >
                                    Explore Features
                                </button>
                            </div>
                        </div>

                        {/* Right */}
                        <div className="flex-shrink-0">
                            <div className="w-64 h-64 sm:w-80 sm:h-80 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/20 shadow-2xl">
                                <div className="text-center">
                                    <div className="w-20 h-20 mx-auto bg-white rounded-2xl shadow-lg flex items-center justify-center mb-4">
                                        <svg className="w-10 h-10 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                                        </svg>
                                    </div>
                                    <p className="text-white font-semibold text-lg">SmartPark</p>
                                    <p className="text-green-200 text-sm">Rubavu, Rwanda</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section
                ref={featuresRef}
                id="features"
                className="py-20 sm:py-28 bg-gradient-to-b from-green-50 to-white"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl font-bold text-green-900">Core Features</h2>
                        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                            Everything you need to run a professional car repair workshop efficiently.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((f, i) => (
                            <div
                                key={f.title}
                                className="group bg-white rounded-2xl shadow-md hover:shadow-xl p-8 border border-green-100 hover:border-green-200 hover:-translate-y-1.5 transition-all duration-300"
                            >
                                <div className="w-14 h-14 rounded-xl bg-green-50 group-hover:bg-green-100 flex items-center justify-center mb-5 transition-colors">
                                    {f.icon}
                                </div>
                                <h3 className="text-xl font-bold text-green-900 mb-3">{f.title}</h3>
                                <p className="text-gray-600 leading-relaxed text-sm">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Login Section */}
            <section
                ref={loginRef}
                id="login"
                className="py-20 sm:py-28 bg-gradient-to-br from-green-800 via-green-700 to-green-900"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row items-stretch gap-10 max-w-6xl mx-auto">
                        {/* Left - Info */}
                        <div className="flex-1 flex flex-col justify-center text-center lg:text-left">
                            <h2 className="text-4xl sm:text-5xl font-bold text-white">Welcome Back</h2>
                            <p className="mt-4 text-lg text-green-100 max-w-md mx-auto lg:mx-0">
                                Sign in to access the SmartPark CRPMS dashboard and manage all your car repair operations.
                            </p>
                            <div className="mt-8 grid grid-cols-2 gap-4 max-w-sm mx-auto lg:mx-0">
                                {['Vehicle Management', 'Service Tracking', 'Payment Records', 'Analytics'].map((item) => (
                                    <div key={item} className="flex items-center gap-2 text-green-100 text-sm">
                                        <svg className="w-4 h-4 text-green-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right - Login Form */}
                        <div className="w-full max-w-md mx-auto lg:mx-0 lg:flex-shrink-0">
                            <div className="bg-white rounded-2xl shadow-2xl p-8">
                                <div className="text-center mb-6">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4">
                                        <svg className="w-8 h-8 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-green-900">Sign In</h3>
                                    <p className="text-gray-500 text-sm mt-1">Enter your credentials</p>
                                </div>
                                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-green-900 mb-1.5">Username</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </span>
                                            <input
                                                type="text"
                                                value={form.username}
                                                onChange={e => set('username', e.target.value)}
                                                placeholder="Enter your username"
                                                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${errors.username ? 'border-red-400 bg-red-50' : 'border-green-200 bg-green-50'}`}
                                            />
                                        </div>
                                        {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-green-900 mb-1.5">Password</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                            </span>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={form.password}
                                                onChange={e => set('password', e.target.value)}
                                                placeholder="Enter your password"
                                                className={`w-full pl-10 pr-10 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${errors.password ? 'border-red-400 bg-red-50' : 'border-green-200 bg-green-50'}`}
                                            />
                                            <button type="button" onClick={() => setShowPassword(v => !v)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 hover:text-green-600">
                                                {showPassword
                                                    ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                                    : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                }
                                            </button>
                                        </div>
                                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                    </div>
                                    <button type="submit" disabled={loading}
                                        className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-md">
                                        {loading ? (
                                            <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg> Signing in…</>
                                        ) : (
                                            <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg> Sign In</>
                                        )}
                                    </button>
                                </form>
                                <div className="text-center text-sm text-green-700 mt-6 space-y-2">
                                    <p>
                                        Don't have an account?{' '}
                                        <Link to="/register" className="font-semibold text-green-800 hover:underline">Create one</Link>
                                    </p>
                                    <p>
                                        <Link to="/forgot-password" className="text-green-600 hover:text-green-800 hover:underline">Forgot password?</Link>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-green-900 text-green-300 text-center text-sm py-6 px-4">
                <p>© 2026 SmartPark CRPMS Rwanda Version 1.0</p>
                <p className="text-green-400 text-xs mt-1">Rubavu District, Western Province, Rwanda</p>
            </footer>
        </div>
    );
}
