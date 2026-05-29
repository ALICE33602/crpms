import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [step, setStep] = useState('email');
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [code, setCode] = useState('');
    const [codeError, setCodeError] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [loading, setLoading] = useState(false);
    const [devCode, setDevCode] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSendCode = async (e) => {
        e.preventDefault();
        if (!email) { setEmailError('Email is required'); return; }
        if (!/^\S+@\S+\.\S+$/.test(email)) { setEmailError('Enter a valid email'); return; }
        setEmailError('');
        setLoading(true);
        try {
            const { data } = await api.post('/auth/forgot-password', { email });
            if (data.devCode) { setDevCode(data.devCode); toast.success('Dev mode — code generated!'); }
            else toast.success('Verification code sent to your email');
            setStep('code');
        } catch {
            toast.error('Something went wrong. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        setCodeError('');
        setPasswordError('');
        if (!code || code.length !== 6) { setCodeError('Enter the 6-digit code'); return; }
        if (!password) { setPasswordError('Password is required'); return; }
        if (password.length < 6) { setPasswordError('Password must be at least 6 characters'); return; }
        if (password !== confirmPassword) { setPasswordError('Passwords do not match'); return; }
        setLoading(true);
        try {
            await api.post('/auth/reset-with-code', { email, code, password });
            toast.success('Password reset successful! Please log in.');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Reset failed. Code may have expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-green-800 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg mb-4">
                        <svg className="w-10 h-10 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-white">Forgot Password</h1>
                    <p className="text-green-200 text-sm mt-1">SmartPark CRPMS — Account Recovery</p>
                </div>

                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    {step === 'email' ? (
                        <div className="space-y-5">
                            <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm text-green-700">Enter your registered email to receive a verification code.</p>
                            </div>

                            <form onSubmit={handleSendCode} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-green-900 mb-1.5">Email Address</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </span>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={e => { setEmail(e.target.value); setEmailError(''); }}
                                            className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${emailError ? 'border-red-400 bg-red-50' : 'border-green-200 bg-green-50'}`}
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                    {emailError && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                            {emailError}
                                        </p>
                                    )}
                                </div>

                                <button type="submit" disabled={loading}
                                    className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-md">
                                    {loading ? (
                                        <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg> Sending…</>
                                    ) : (
                                        <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> Send Code</>
                                    )}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <form onSubmit={handleReset} className="space-y-4">
                            <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm text-green-700">Enter the 6-digit code sent to <strong>{email}</strong> and choose a new password.</p>
                            </div>

                            {devCode && (
                                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 text-center">
                                    <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide mb-2">⚠ Dev Mode — Your Code</p>
                                    <p className="text-3xl font-bold text-yellow-800 tracking-[12px] font-mono">{devCode}</p>
                                    <p className="text-xs text-yellow-600 mt-2">This code is shown because no real email is sent in dev mode</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-green-900 mb-1.5">Verification Code</label>
                                <input
                                    type="text"
                                    value={code}
                                    onChange={e => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setCodeError(''); }}
                                    placeholder="000000"
                                    maxLength={6}
                                    className={`w-full text-center text-lg tracking-[8px] font-mono border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition ${codeError ? 'border-red-400 bg-red-50' : 'border-green-200 bg-green-50'}`}
                                />
                                {codeError && <p className="text-red-500 text-xs mt-1">{codeError}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-green-900 mb-1.5">New Password</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                    </span>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-10 py-2.5 border border-green-200 bg-green-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                                        placeholder="••••••••"
                                    />
                                    <button type="button" onClick={() => setShowPassword(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 hover:text-green-600">
                                        {showPassword
                                            ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                            : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        }
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-green-900 mb-1.5">Confirm Password</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </span>
                                    <input
                                        type={showConfirm ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        className="w-full pl-10 pr-10 py-2.5 border border-green-200 bg-green-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                                        placeholder="••••••••"
                                    />
                                    <button type="button" onClick={() => setShowConfirm(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 hover:text-green-600">
                                        {showConfirm
                                            ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                            : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        }
                                    </button>
                                </div>
                                {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setStep('email')}
                                    className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm hover:bg-gray-50">
                                    Back
                                </button>
                                <button type="submit" disabled={loading}
                                    className="flex-1 bg-green-700 hover:bg-green-800 text-white font-semibold py-2.5 rounded-lg transition-all disabled:opacity-60 shadow-md">
                                    {loading ? 'Resetting…' : 'Reset Password'}
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="mt-6 pt-5 border-t border-green-100 text-center">
                        <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-green-600 hover:text-green-800 font-medium">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
