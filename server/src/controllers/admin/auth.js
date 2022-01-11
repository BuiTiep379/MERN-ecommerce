const User = require('../../models/user');
const jwt = require('jsonwebtoken');
const shortid = require('shortid')
const { Create, ServerError, BadRequest, Response, Unauthorized } = require('../../utils/response');

const ONE_SECCOND = 1000;
const ONE_MiNUTE = ONE_SECCOND * 60;
const ONE_HOUR = ONE_MiNUTE * 60;

const signin = async (req, res) => {
    User.findOne({ email: req.body.email }).exec(async (error, user) => {
        if (error) return ServerError(res, error);
        if (!user) return BadRequest(res, "Admin does not exist");
        const isAuthen = await user.authenticate(req.body.password);
        if (!isAuthen) return BadRequest(res, "Wrong password");
        if (user.role !== "admin")
            return Unauthorized(res);
        const token = await jwt.sign({
            exp: Math.floor(Date.now()) + ONE_HOUR,
            data: { _id: user._id, role: user.role }
        }, process.env.JWT_SECRET);
        const { firstName, lastName, email, fullName } = user;
        return Response(res, {
            token,
            user: { firstName, lastName, email, fullName },
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
        const newUser = new User({
            firstName,
            lastName,
            email,
            password,
            role: 'admin',
            username: shortid.generate(),
        });
        newUser.save(async (error, user) => {
            if (error) return ServerError(res, error.message);
            if (user) {
                const token = await jwt.sign({
                    exp: Math.floor(Date.now()) + ONE_HOUR,
                    data: { _id: user._id, role: user.role }
                }, process.env.JWT_SECRET);
                const { firstName, lastName, email, fullName } = user;
                return Create(res, {
                    token,
                    user: { firstName, lastName, email, fullName },
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