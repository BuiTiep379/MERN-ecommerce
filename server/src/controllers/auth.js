const User = require('../models/user');
const shortid = require('shortid')
const { Create, ServerError, BadRequest, Response, Unauthorized } = require('../middleware/response');
const { attachCookiesToResponse, createTokenUser } = require('../utils');
const signin = async (req, res) => {
    User.findOne({ email: req.body.email }).exec(async (error, user) => {
        if (error) return ServerError(res, error);
        if (!user) return BadRequest(res, "User does not exist");
        const isAuthen = await user.authenticate(req.body.password);
        if (!isAuthen) return BadRequest(res, "Wrong password");
        const tokenUser = createTokenUser(user);
        attachCookiesToResponse({ res, user: tokenUser });
        return Response(res, {
            user: tokenUser,
        });
    })
};


const signup = (req, res) => {
    User.findOne({ email: req.body.email }).exec(async (error, user) => {
        if (error) return ServerError(res, error);
        // đã có user 
        if (user) return BadRequest(res, "User already registered");
        const { firstName, lastName, email, password } = req.body;
        // tạo user mới
        const newUser = new User({
            firstName,
            lastName,
            email,
            password,
            username: shortid.generate(),
        });
        newUser.save(async (error, user) => {
            if (error) return ServerError(res, error.message);
            if (user) {
                const tokenUser = createTokenUser(user);
                attachCookiesToResponse({ res, user: tokenUser });
                return Create(res, {
                    user: tokenUser,
                });
            }
        })
    })
};

const signout = (req, res) => {
    return Response(res, { message: "Signout successfully ...!" });
};
module.exports = {
    signin, signup, signout
}