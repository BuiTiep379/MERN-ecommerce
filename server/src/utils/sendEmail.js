const nodemailer = require("nodemailer");
const nodemailerConfig = require('./nodemailerConfig');
const sendMail = async ({ to, subject, html }) => {
    const transporter = nodemailer.createTransport(nodemailerConfig);

    return transporter.sendMail({
        from: `"Bui Tiep"`,
        to,
        subject,
        html,
    });
};

module.exports = sendMail;