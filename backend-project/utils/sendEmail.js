const nodemailer = require('nodemailer');

/**
 * Send an email using nodemailer.
 * @param {object} options - { to, subject, html }
 */
const sendEmail = async ({ to, subject, html }) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: false, // true for 465, false for 587
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
