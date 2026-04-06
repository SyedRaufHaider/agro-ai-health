const nodemailer = require("nodemailer");

/**
 * Send an email
 * @param {Object} options - { to, subject, html }
 */
const sendEmail = async ({ to, subject, html }) => {
    // Create transporter fresh each call so missing env vars don't crash the server on startup
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false, // true only for port 465
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        tls: {
            rejectUnauthorized: false, // allow self-signed certs in dev
        },
    });

    // Verify connection before sending
    await transporter.verify();

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
