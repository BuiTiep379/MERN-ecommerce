const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
    },
    type: {
        type: String,
    },
    categoryImage: { type: String },
    parentId: {
        type: String,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
});
// categorySchema.pre('save', async function () {
//     if (error.code === 11000) {
//         error = "Category have been created"
//     }
// })
categorySchema.post('save', function (error, doc, next) {
    if (error.code === 11000) {
        next(new Error("The category existed"));
    }
    else {
        next();
    }
});
module.exports = mongoose.model('Category', categorySchema);