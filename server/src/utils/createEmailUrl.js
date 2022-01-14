const jwt = require('jsonwebtoken');
const createEmailUrl = (userId) => {
    const date = new Date();
    const mail = {
        "id": user.id,
        "created": date.toString()
    }

    const token_mail_verification = jwt.sign(mail, process.env.JWT_SECRET_MAIL, { expiresIn: '1d' });

    const url = process.env.BASE_URL + "verify?id=" + token_mail_verification;
    return url;
};

module.exports = createEmailUrl;

