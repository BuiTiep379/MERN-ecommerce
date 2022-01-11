const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
        min: 1,
        max: 20,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        min: 1,
        max: 20,
    },
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    contactNumner: { type: String },
    profilePicture: { type: String },
},
    { timestamps: true }
);
userSchema.virtual("fullName").get(function () {
    return `${this.firstName} ${this.lastName}`;
});
userSchema.methods = {
    authenticate: async function (password) {
        const isAuthen = await bcrypt.compare(password, this.password);
        return isAuthen;
    },
};
userSchema.pre('save', async function () {
    // generate salt to hash password
    const salt = await bcrypt.genSalt(10);
    // now we set user password to hashed password
    this.password = await bcrypt.hash(this.password, salt);
})
module.exports = mongoose.model("User", userSchema);