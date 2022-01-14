const { isTokenValid } = require('../utils/jwt');
const { attachCookiesToResponse } = require('../utils');
const { Unauthenticated, Unauthorized } = require('./response');
const authenticateUser = async (req, res, next) => {
    const { accessToken, refreshToken } = req.signedCookies;

    try {
        if (accessToken) {
            const { name, userId, role } = isTokenValid(accessToken);
            req.user = { name, userId, role };
            return next();
        }
        const payload = isTokenValid(refreshToken);
        console.log(payload);
        const existingToken = await Token.findOne({ user: payload.user.userId, refreshToken: payload.refreshToken });
        if (!existingToken || !existingToken?.isValid) {
            Unauthenticated(res);
        };
        attachCookiesToResponse({ res, user: payload.user, refreshToken });
        req.user = payload.user;
        next();
    } catch (error) {
        Unauthenticated(res, error);
    }
};

const authorizePermissions = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            Unauthorized(res);
        }
        next();
    };
};

module.exports = {
    authenticateUser, authorizePermissions
}
