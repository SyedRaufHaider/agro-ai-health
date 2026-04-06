const https = require("https");

const BREVO_HOST = "api.brevo.com";
const BREVO_PATH = "/v3/smtp/email";

/**
 * Send an email via Brevo HTTP API using Node built-in https
 * No external dependencies — works on all hosting platforms
 * @param {Object} options - { to, subject, html }
 */
const sendEmail = ({ to, subject, html }) => {
    return new Promise((resolve, reject) => {
        if (!process.env.BREVO_API_KEY) {
            return reject(new Error("BREVO_API_KEY is not set in environment variables."));
        }

        const payload = JSON.stringify({
            sender: {
                name: process.env.SMTP_FROM_NAME || "Agro AI Health",
                email: process.env.SMTP_FROM_EMAIL,
            },
            to: [{ email: to }],
            subject,
            htmlContent: html,
        });

        const options = {
            hostname: BREVO_HOST,
            path: BREVO_PATH,
            method: "POST",
            headers: {
                "api-key": process.env.BREVO_API_KEY,
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Content-Length": Buffer.byteLength(payload),
            },
        };

        const req = https.request(options, (res) => {
            let data = "";
            res.on("data", (chunk) => { data += chunk; });
            res.on("end", () => {
                try {
                    const parsed = JSON.parse(data);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        console.log(`📧 Email sent to ${to} | Message ID: ${parsed.messageId}`);
                        resolve(parsed);
                    } else {
                        reject(new Error(`Brevo API error ${res.statusCode}: ${parsed.message || data}`));
                    }
                } catch (e) {
                    reject(new Error(`Brevo response parse error: ${data}`));
                }
            });
        });

        req.on("error", (err) => {
            reject(new Error(`Email request failed: ${err.message}`));
        });

        req.write(payload);
        req.end();
    });
};

module.exports = sendEmail;
