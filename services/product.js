const { ObjectId } = require("mongodb");

const productModel = require("../models/product");
const userModel = require("../models/user");
const brandModel = require("../models/brand");
const categoryModel = require("../models/category");

const { isVariantProduct } = require("../helpers");

module.exports = {
    insert,
    update
};

async function insert(body) {
    try {

        const { name, images, variants, description, brand_id, category_id } = body

        const brand = await brandModel.findById(brand_id)
        if (!brand) return { status: 400, message: "Thương hiệu không tồn tại !" }

        const category = await categoryModel.findById(category_id)
        if (!category) return { status: 400, message: "Danh mục không tồn tại !" }

        if (!Array.isArray(JSON.parse(images)) || !JSON.parse(images).every(item => typeof item === 'string')) return { status: 400, message: "Images không đúng dữ liệu !" }
        if (!Array.isArray(JSON.parse(variants))) return { status: 400, message: "Variants không đúng dữ liệu !" }

        const productNew = new productModel({
            name: name,
            images: JSON.parse(images),
            variants: JSON.parse(variants),
            view: 0,
            description: description,
            brand_id: brand._id,
            category_id: category._id,
        })

        await productNew.save()

        return { status: 200, message: "Success" }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function update(id, body) {
    try {
        const product = await productModel.findById(id)
        if (!product) return { status: 400, message: "Sản phẩm không tồn tại !" }

        const { name, images, variants, description, brand_id, category_id } = body

        const brand = await brandModel.findById(brand_id)
        if (!brand) return { status: 400, message: "Thương hiệu không tồn tại !" }

        const category = await categoryModel.findById(category_id)
        if (!category) return { status: 400, message: "Danh mục không tồn tại !" }

        if (!Array.isArray(JSON.parse(images))) return { status: 400, message: "Images không đúng dữ liệu !" }
        if (!Array.isArray(JSON.parse(variants))) return { status: 400, message: "Variants không đúng dữ liệu !" }

        await productModel.findByIdAndUpdate(id, {
            $set: {
                name: name,
                images: JSON.parse(images),
                variants: JSON.parse(variants),
                description: description,
                brand_id: brand._id,
                category_id: category._id,
            }
        }, { new: true })

        return { status: 200, message: "Success" }
    } catch (error) {
        console.log(error);
        throw error;
    }
}