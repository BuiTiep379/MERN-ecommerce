const User = require('../models/user');
const Token = require('../models/token')
const shortid = require('shortid');
const crypto = require('crypto');
const { Create, ServerError, BadRequest, Response, Unauthorized, Unauthenticated, NotFound } = require('../middleware/response');
const { attachCookiesToResponse, createTokenUser, sendVerificationEmail, sendResetPasswordEmail, createHash } = require('../utils');
const signin = async (req, res) => {
    User.findOne({ email: req.body.email }).exec(async (error, user) => {
        if (error) return ServerError(res, error.message);
        if (!user) return BadRequest(res, "User does not exist");
        const isAuthen = await user.authenticate(req.body.password);
        if (!isAuthen) return BadRequest(res, "Wrong password");
        if (!user.isVerified) {
            return Unauthenticated(res, "Account is not verified");
        };
        const tokenUser = createTokenUser(user);
        // create refreshToken
        let refreshToken = '';
        // check token
        const existingToken = await Token.findOne({ user: user._id });
        if (existingToken) {
            const { isValid } = existingToken;
            if (!isValid) {
                return Unauthenticated(res);
            }
            refreshToken = existingToken.refreshToken;
            attachCookiesToResponse({ res, user: tokenUser, refreshToken });
            return Response(res, {
                user: tokenUser,
            });
        }
        refreshToken = crypto.randomBytes(40).toString('hex');
        const userAgent = req.headers['user-agent'];
        const ip = req.ip;
        const userToken = { refreshToken, ip, userAgent, user: user._id };
        await Token.create(userToken);
        attachCookiesToResponse({ res, user: tokenUser, refreshToken });
        return Response(res, {
            user: tokenUser,
        });
    })
};


const signup = (req, res) => {
    User.findOne({ email: req.body.email }).exec(async (error, user) => {
        if (error) return ServerError(res, error.message);
        // đã có user 
        if (user) return BadRequest(res, "User already registered");
        const { firstName, lastName, email, password } = req.body;
        const verificationToken = crypto.randomBytes(40).toString('hex');
        // tạo user mới
        const newUser = new User({
            firstName,
            lastName,
            email,
            password,
            verificationToken,
            username: shortid.generate(),
        });
        newUser.save(async (error, user) => {
            if (error) return ServerError(res, error.message);
            if (user) {
                const { firstName, email, verificationToken, role } = user;
                const origin = `http://localhost:3000`;
                await sendVerificationEmail({ firstName, email, role, verificationToken, origin });
                return Create(
                    res,
                    'Success! check email to verify account',
                    verificationToken
                )
            }
        })
    })
};

const verifyEmail = (req, res, next) => {
    const { email, verificationToken } = req.body;
    User.findOne({ email: email }).exec(async (error, user) => {
        if (error) return ServerError(res, error.message);
        if (!user) return NotFound(res, "User");
        if (user.verificationToken !== verificationToken) return BadRequest(res, "Token does not match verification token");
        user.isVerified = true;
        user.verified = Date.now();
        user.verificationToken = "";
        user.save(async (error, user) => {
            if (error) return ServerError(res, error.message);
            if (user) {
                return Response(res, { message: 'Success! Account is active' });
            }
        })
    })
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return BadRequest(res, "Please provide email!");
    };
    const user = await User.findOne({ email });
    if (!user) return NotFound(res, "User");
    const tenMinutes = 1000 * 60 * 10;
    const passwordToken = crypto.randomBytes(70).toString('hex');
    const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);
    const origin = `http://localhost:3000`;
    await sendResetPasswordEmail({ firstName: user.firstName, email, role: user.role, passwordToken, origin });
    user.passwordToken = createHash(passwordToken);;
    user.passwordTokenExpirationDate = passwordTokenExpirationDate;
    await user.save();
    return Response(res, { message: 'Please check your email for reset password link' });
}
const resetPassword = async (req, res) => {
    const { passwordToken, email, password } = req.body;
    if (!passwordToken || !email || !password) {
        return BadRequest(res, 'Please provide all values');
    }
    const user = await User.findOne({ email });
    if (!user) return NotFound(res, "User");
    const currentDate = new Date();
    if (user.passwordToken === createHash(passwordToken) && user.passwordTokenExpirationDate > currentDate) {
        user.password = password;
        user.passwordToken = null;
        user.passwordTokenExpirationDate = null;
        await user.save();
    }
    return Response(res, { message: 'Reset password successfully!' });
}

const signout = async (req, res) => {
    await Token.findOneAndDelete({ user: req.user.userId });
    res.cookie('accessToken', 'signout', {
        httpOnly: true,
        expires: new Date(Date.now()),
    });

    res.cookie('refreshToken', 'signout', {
        httpOnly: true,
        expires: new Date(Date.now()),
    });
    Response(res, { message: "Signout successfully ...!" });
};

module.exports = {
    signin, signup, signout, verifyEmail, forgotPassword, resetPassword
}