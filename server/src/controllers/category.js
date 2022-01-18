const Category = require('../models/category');
const slugify = require('slugify');

const { Create, ServerError, BadRequest, Response, Unauthorized, Unauthenticated, NotFound } = require('../middleware/response');

function createCategories(categories, parentId = null) {
    const categoryList = [];
    let category;
    if (parentId == null) {
        category = categories.filter((cat) => cat.parentId == undefined);
    } else {
        category = categories.filter((cat) => cat.parentId == parentId);
    }
    for (let cate of category) {
        categoryList.push({
            _id: cate._id,
            name: cate.name,
            slug: cate.slug,
            parentId: cate.parentId,
            type: cate.type,
            categoryImage: cate.categoryImage,
            children: createCategories(categories, cate._id),
        });
    }
    return categoryList;
}
const createCategory = (req, res) => {
    const categoryObj = new Category({
        name: req.body.name,
        slug: `${slugify(req.body.name, { lower: true })}`,
        createdBy: req.user.userId
    });
    if (req.body.type) {
        categoryObj.type = req.body.type;
    };
    if (req.file) {
        categoryObj.categoryImage = req.file.filename;
    };
    if (req.body.parentId) {
        categoryObj.parentId = req.body.parentId;
    }
    categoryObj.save(async (error, category) => {
        if (error) return ServerError(res, error.message);
        if (category) {
            return Create(
                res,
                'Success! Category created successfully',
                category
            )
        }
    })
}

const getCategories = (req, res) => {
    Category.find({}).exec((error, categories) => {
        if (error) return ServerError(res, error.message);
        if (categories) {
            const categoryList = createCategories(categories);
            return Response(res, { categoryList });
        }
    });
};

const updateCategories = async (req, res) => {
    const { _id, name, parentId, type } = req.body;
    let updatedCategories = [];
    if (name instanceof Array) {
        for (let i = 0; i < name.length; i++) {
            const category = {
                name: name[i],
                type: type[i],
            }
            if (parentId[i] !== "") {
                category.parentId = parentId[i];
            }
            const updatedCategory = await Category.findOneAndUpdate(
                { _id: _id[i] },
                category,
                { new: true }
            );
            updatedCategories.push(updatedCategory);
            return Response(res, { updatedCategories });
            // return res.status(201).json({ updateCategories: updatedCategories });
        }
    } else {
        const category = { name, type };
        if (parentId[i] !== "") {
            category.parentId = parentId[i];
        }
        const updatedCategory = await Category.findOneAndUpdate(
            { _id },
            category,
            { new: true }
        );
        return Response(res, { updatedCategories: updatedCategory });
    }
};

const deleteCategories = async (req, res) => {
    const { ids } = req.body.payload;
    const deletedCategories = [];
    for (let i = 0; i < ids.length; i++) {
        const deleteCategory = await Category.findOneAndDelete({
            _id: ids[i]._id,
            createdBy: req.user._id,
        });
        deletedCategories.push(deleteCategory);
    }

    if (deletedCategories.length == ids.length) {
        return Response(res, { message: "Categories removed" });
    } else {
        return BadRequest(res, { message: "Something went wrong" })
    }
}

module.exports = {
    createCategory,
    getCategories,
    updateCategories,
    deleteCategories,
}