const nodemailer = require("nodemailer");
const nodemailerConfig = require('./nodemailerConfig');
const sendMail = async ({ to, subject, html }) => {
    const transporter = nodemailer.createTransport(nodemailerConfig);

    return transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html,
    });
};

module.exports = sendMail;