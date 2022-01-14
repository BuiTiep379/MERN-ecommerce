const User = require('../../models/user');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const shortid = require('shortid')
const { Create, ServerError, BadRequest, Response, Unauthorized, Unauthenticated, NotFound } = require('../../middleware/response');
const { attachCookiesToResponse, createTokenUser, sendMail, sendVerificationEmail, sendResetPasswordEmail } = require('../../utils');
const Token = require('../../models/token');
const signin = async (req, res) => {
    User.findOne({ email: req.body.email }).exec(async (error, user) => {
        if (error) return ServerError(res, error);
        if (!user) return BadRequest(res, "Admin does not exist");
        const isAuthen = await user.authenticate(req.body.password);
        if (!isAuthen) return BadRequest(res, "Wrong password");
        if (user.role !== "admin")
            return Unauthorized(res);
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
        if (error) return ServerError(res, error);
        // đã có user 
        if (user) return BadRequest(res, "Admin already registered");
        const { firstName, lastName, email, password } = req.body;
        // tạo user mới
        const verificationToken = crypto.randomBytes(40).toString('hex');
        const newUser = new User({
            firstName,
            lastName,
            email,
            password,
            role: 'admin',
            verificationToken,
            username: shortid.generate(),
        });
        newUser.save(async (error, user) => {
            if (error) return ServerError(res, error.message);
            if (user) {
                // const tokenUser = createTokenUser(user);
                // attachCookiesToResponse({ res, user: tokenUser });
                // return Create(res, {
                //     user: tokenUser,
                // });
                const { firstName, email, verificationToken } = user;
                const origin = `http://localhost:3000`;
                await sendVerificationEmail({ firstName, email, role: user.role, verificationToken, origin });
                res.status(201).json({
                    msg: 'Success! check email to verify account',
                    verificationToken
                })
            }
        })
    })
};
const verifyEmail = (req, res, next) => {
    const { email, verificationToken } = req.body;
    User.findOne({ email: email }).exec(async (error, user) => {
        if (error) return ServerError(res, error);
        if (!user) return NotFound(res, "Admin");
        if (user.verificationToken !== verificationToken) return BadRequest(res, "Token does not match verification token");
        user.isVerified = true;
        user.verified = Date.now();
        user.verificationToken = "";
        user.save(async (error, user) => {
            if (error) return ServerError(res, error.message);
            if (user) {
                // const tokenUser = createTokenUser(user);
                // attachCookiesToResponse({ res, user: tokenUser });
                // return Create(res, {
                //     user: tokenUser,
                // });
                res.status(201).json({
                    msg: 'Success! ',
                })
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
    user.passwordToken = passwordToken;
    user.passwordTokenExpirationDate = passwordTokenExpirationDate;
    await user.save();
    res.status(200).json({
        msg: 'Please check your email for reset password link',
    })
}
const resetPassword = async (req, res) => {
    const { passwordToken, email, password } = req.body;
    if (!passwordToken || !email || !password) {
        return BadRequest(res, 'Please provide all values');
    }
    const user = await User.findOne({ email });
    if (!user) return NotFound(res, "User");
    const currentDate = new Date();
    if (user.passwordToken === passwordToken && user.passwordTokenExpirationDate > currentDate) {
        user.password = password;
        user.passwordToken = null;
        user.passwordTokenExpirationDate = null;
        await user.save();
    }
    res.send('reset password');
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