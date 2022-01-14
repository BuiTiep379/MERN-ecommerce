const sendEmail = require('./sendEmail');

const sendVerificationEmail = async ({
    firstName,
    email,
    verificationToken,
    origin,
}) => {
    const verifyEmail = `${origin}/auth/verify-email?token=${verificationToken}&email=${email}`;

    const message = `<p>Please confirm your email by clicking on the following link : 
  <a href="${verifyEmail}">Verify Email</a> </p>`;

    return sendEmail({
        to: email,
        subject: 'Email Confirmation',
        html: `<h4> Hello, ${firstName}</h4>
    ${message}
    `,
    });
};

module.exports = sendVerificationEmail;