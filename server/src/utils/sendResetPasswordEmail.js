const sendEmail = require('./sendEmail');

const sendResetPasswordEmail = async ({
    firstName,
    email,
    passwordToken,
    origin,
}) => {
    const resetPassword = `${origin}/auth/verify-email?passwordToken=${passwordToken}&email=${email}`;

    const message = `<p>Please reset your password by clicking on the following link : 
  <a href="${resetPassword}">Verify Email</a> </p>`;

    return sendEmail({
        to: email,
        subject: 'Reset password Confirmation',
        html: `<h4> Hello, ${firstName}</h4>
    ${message}
    `,
    });
};
module.exports = sendResetPasswordEmail;