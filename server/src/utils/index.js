const {
    createJWT,
    isTokenValid,
    attachCookiesToResponse
} = require('./jwt');
const createTokenUser = require('./createTokenUser');
const sendMail = require('./sendEmail');
const sendVerificationEmail = require('./sendVerificationEmail');
const sendResetPasswordEmail = require('./sendResetPasswordEmail');
const createHash = require('./createHash');
module.exports = {
    createJWT,
    isTokenValid,
    attachCookiesToResponse,
    createTokenUser,
    sendMail,
    sendVerificationEmail,
    sendResetPasswordEmail,
    createHash,
}