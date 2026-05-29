const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const handleError = (res, error) => {
    console.error('[ERROR]', error.message);
    if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        return res.status(400).json({ success: false, message: `${field} already exists` });
    }
    if (error.name === 'ValidationError') {
        const msg = Object.values(error.errors).map(e => e.message).join(', ');
        return res.status(400).json({ success: false, message: msg });
    }
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
};

// POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;

        if (!username || !email || !password || !confirmPassword)
            return res.status(400).json({ success: false, message: 'All fields are required' });

        if (!/^[a-zA-Z0-9]+$/.test(username))
            return res.status(400).json({ success: false, message: 'Username can only contain letters and numbers' });

        if (!/^\S+@\S+\.\S+$/.test(email))
            return res.status(400).json({ success: false, message: 'Invalid email format' });

        if (password !== confirmPassword)
            return res.status(400).json({ success: false, message: 'Passwords do not match' });

        if (password.length < 6)
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

        const existing = await User.findOne({ $or: [{ username }, { email }] });
        if (existing) {
            const field = existing.username === username ? 'Username' : 'Email';
            return res.status(400).json({ success: false, message: `${field} already exists` });
        }

        const user = await User.create({ username, email, password, role: 'manager' });
        const token = generateToken(user._id);

        return res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user: { id: user._id, username: user.username, email: user.email, role: user.role },
        });
    } catch (error) {
        return handleError(res, error);
    }
};

// POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password)
            return res.status(400).json({ success: false, message: 'Username and password are required' });

        const user = await User.findOne({ username });
        if (!user || !(await user.matchPassword(password)))
            return res.status(401).json({ success: false, message: 'Invalid username or password' });

        const token = generateToken(user._id);
        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: { id: user._id, username: user.username, email: user.email, role: user.role },
        });
    } catch (error) {
        return handleError(res, error);
    }
};

// POST /api/auth/logout
exports.logout = async (req, res) => {
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        return res.status(200).json({ success: true, user });
    } catch (error) {
        return handleError(res, error);
    }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email)
            return res.status(400).json({ success: false, message: 'Email is required' });

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user)
            return res.status(200).json({ success: true, message: 'Verification code sent if email exists' });

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

        user.resetPasswordToken = hashedCode;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
        await user.save({ validateBeforeSave: false });

        try {
            await sendEmail({
                to: user.email,
                subject: 'CRPMS Password Reset Code',
                html: ` <p>You requested a password reset.</p>
                        <p>Your verification code is:</p>
                        <h2 style="letter-spacing:8px;font-size:28px;text-align:center;background:#f0fdf4;padding:12px;border-radius:8px;">${code}</h2>
                        <p>This code expires in 15 minutes.</p>`,
            });
        } catch {
            // Email send failed — dev mode will still show code
        }

        if (process.env.NODE_ENV === 'development') {
            return res.status(200).json({
                success: true,
                message: 'Dev mode — verification code generated',
                devCode: code,
            });
        }

        return res.status(200).json({ success: true, message: 'Verification code sent to your email' });
    } catch (error) {
        return handleError(res, error);
    }
};

// POST /api/auth/reset-with-code
exports.resetWithCode = async (req, res) => {
    try {
        const { email, code, password } = req.body;
        if (!email || !code || !password)
            return res.status(400).json({ success: false, message: 'Email, code and password are required' });

        if (password.length < 6)
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

        const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

        const user = await User.findOne({
            email: email.toLowerCase(),
            resetPasswordToken: hashedCode,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user)
            return res.status(400).json({ success: false, message: 'Invalid or expired verification code' });

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return res.status(200).json({ success: true, message: 'Password reset successful' });
    } catch (error) {
        return handleError(res, error);
    }
};
