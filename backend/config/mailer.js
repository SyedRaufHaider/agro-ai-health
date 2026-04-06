const fetch = require("node-fetch");

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

/**
 * Send an email via Brevo HTTP API (works on all hosting platforms)
 * @param {Object} options - { to, subject, html }
 */
const sendEmail = async ({ to, subject, html }) => {
    if (!process.env.BREVO_API_KEY) {
        throw new Error("BREVO_API_KEY is not set in environment variables.");
    }

    const payload = {
        sender: {
            name: process.env.SMTP_FROM_NAME || "Agro AI Health",
            email: process.env.SMTP_FROM_EMAIL,
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
    };

    const response = await fetch(BREVO_API_URL, {
        method: "POST",
        headers: {
            "api-key": process.env.BREVO_API_KEY,
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
            `Brevo API error: ${response.status} — ${error.message || response.statusText}`
        );
    }

    const result = await response.json();
    console.log(`📧 Email sent to ${to} | Message ID: ${result.messageId}`);
    return result;
};

module.exports = sendEmail;
