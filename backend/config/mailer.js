const nodemailer = require("nodemailer");

/**
 * Send an email via SMTP
 * @param {Object} options - { to, subject, html }
 */
const sendEmail = async ({ to, subject, html }) => {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        throw new Error("SMTP environment variables are not configured. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS.");
    }

    const port = Number(process.env.SMTP_PORT) || 587;
    const secure = port === 465; // true for 465, false for 587

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        connectionTimeout: 10000,  // 10 seconds
        greetingTimeout: 10000,
        socketTimeout: 15000,
        tls: {
            rejectUnauthorized: false,
        },
    });

    const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || "Agro AI Health"}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to,
        subject,
        html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${to} | ID: ${info.messageId}`);
    return info;
};

module.exports = sendEmail;
