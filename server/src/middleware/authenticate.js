const { isTokenValid } = require('../utils');
const { attachCookiesToResponse } = require('../utils');
const { Unauthenticated, Unauthorized } = require('./response');
const authenticateUser = async (req, res, next) => {
    const { accessToken, refreshToken } = req.signedCookies;
    console.log(accessToken, refreshToken);
    try {
        if (accessToken) {
            const decoded = isTokenValid(accessToken);
            const { user: { fullName, userId, role } } = decoded;
            req.user = { fullName, userId, role };
            console.log(decoded)
            return next();
        }
        const decoded = isTokenValid(refreshToken);
        const existingToken = await Token.findOne({ user: decoded.user.userId, refreshToken: decoded.refreshToken });
        if (!existingToken || !existingToken?.isValid) {
            Unauthenticated(res);
        };
        attachCookiesToResponse({ res, user: decoded.user, refreshToken });
        req.user = decoded.user;
        // console.log(decoded.user);
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
