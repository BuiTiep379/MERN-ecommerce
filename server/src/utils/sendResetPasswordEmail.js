const sendEmail = require('./sendEmail');

const sendResetPasswordEmail = async ({
    firstName,
    email,
    role,
    passwordToken,
    origin,
}) => {
    let resetPassword;
    if (role === 'admin') {
        resetPassword = `${origin}/auth/reset-password?passwordToken=${passwordToken}&email=${email}`;
    } else {
        resetPassword = `${origin}/reset-password?tpasswordToken=${passwordToken}&email=${email}`;
    }

    const message = `<p>Please reset your password by clicking on the following link : 
  <a href="${resetPassword}">Reset password</a> </p>`;

    return sendEmail({
        to: email,
        subject: 'Reset password Confirmation',
        html: `<h4> Hello, ${firstName}</h4>
    ${message}
    `,
    });
};
module.exports = sendResetPasswordEmail;