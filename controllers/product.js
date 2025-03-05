
const productModel = require("../models/product");
const brandModel = require("../models/brand");
const categoryModel = require("../models/category");
const propertyModel = require("../models/property");
const reviewModel = require("../models/review");

const { ObjectId } = require("mongodb");

module.exports = {
    getById,
    getQuery,
    getTotalPagesByQuery,
    getSame
};

async function getById(id) {
    try {
        const product = await productModel.findById(id);
        if (!product) return { status: 400, message: "Sản phẩm không tồn tại !" }

        const variants = [];

        for (const variant of product.variants) {

            // lấy tên của property
            const propertyNames = [];
            for (const property_id of variant.property_ids) {
                const property = await propertyModel.findById(property_id);
                propertyNames.push({ name: property?.name, type: property?.type });
            }

            // thêm variant vào variants
            variants.push({
                properties: propertyNames,
                price: variant.price,
                price_sale: variant.price_sale,
                colors: variant.colors.map((color) => ({
                    name: color.name,
                    image: `${process.env.URL}${color.image}`,
                    price_extra: color.price_extra,
                    status: product.status,
                    quantity: color.quantity,
                })),
            });
        }

        const reviews = await reviewModel.find({ product_id: product._id })
        let rating = null
        if (reviews.length) rating = reviews.reduce((sum, e) => sum + e.rating, 0) / reviews.length

        const brand = await brandModel.findById(product.brand_id)
        const category = await categoryModel.findById(product.category_id)

        const data = {
            id: product._id,
            name: product.name,
            images: product.images.map((image) => `${process.env.URL}${image}`),
            variants: variants,
            view: product.view,
            rating: rating,
            description: product.description,
            brand: {
                id: brand._id,
                name: brand.name
            },
            category: {
                id: category._id,
                name: category.name
            },
        };

        return { status: 200, message: "Thành công !", data: data }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function getQuery({ search, id, categoryid, price, orderby, page = 1, limit = 5 }) {
    try {
        let matchCondition = {};

        // Tìm kiếm sản phẩm theo tên
        if (search) {
            matchCondition.name = {
                $regex: search,
                $options: "i",
            };
        }

        // Tìm kiếm sản phẩm theo nhiều id nối bằng dâu '-'
        if (id) {
            matchCondition._id = {
                $in: id.split("-").map((_id) => new ObjectId(_id)),
            };
        }

        // Tìm kiếm sản phẩm theo nhiều id danh mục nối bằng dấu '-'
        if (categoryid) {
            matchCondition.category_id = {
                $in: categoryid.split("-").map((idCat) => new ObjectId(idCat)),
            };
        }

        // Tìm kiếm sản phẩm theo giá từ đên nối bằng dấu '-'
        if (price) {
            const [min, max] = price.split("-");
            matchCondition.finalPrice = {
                $gte: +min,
                $lte: +max,
            };
        }

        let sortCondition = {};

        // sắp xếp sản phẩm theo sort và so, nối bằng dấu '-'
        if (orderby) {
            const [sort, so] = orderby.split("-");
            switch (sort) {
                case "price":
                    sortCondition.finalPrice = so ? so == "desc" ? -1 : 1 : -1;
                    break;

                case "sale":
                    sortCondition.percent = so ? so == "desc" ? -1 : 1 : -1;
                    break;

                default:
                    sortCondition[sort == "id" ? "_id" : sort] = so ? so == "desc" ? -1 : 1 : -1;
                    break;
            }
        } else {
            sortCondition._id = -1;
        }

        const skip = (page - 1) * limit;

        const pipeline = [
            {
                $addFields: {
                    finalPrice: {
                        $subtract: [
                            { $arrayElemAt: ["$variants.price", 0] },
                            { $ifNull: [{ $arrayElemAt: ["$variants.price_sale", 0] }, 0] }
                        ]
                    },
                    percent: {
                        $round: [
                            {
                                $multiply: [
                                    {
                                        $divide: [
                                            { $ifNull: [{ $arrayElemAt: ["$variants.price_sale", 0] }, 0] },
                                            { $arrayElemAt: ["$variants.price", 0] }
                                        ]
                                    },
                                    100
                                ]
                            },
                            0 // Làm tròn số nguyên
                        ]
                    }
                }
            },
            { $match: matchCondition },
            { $sort: sortCondition },
            { $skip: skip },
            { $limit: +limit }
        ];

        const products = await productModel.aggregate(pipeline);

        const data = [];

        for (const product of products) {

            const variants = [];

            for (const variant of product?.variants) {

                const propertyNames = [];

                for (const property_id of variant.property_ids) {
                    const property = await propertyModel.findById(property_id);
                    propertyNames.push({ name: property?.name, type: property?.type });
                }

                variants.push({
                    properties: propertyNames,
                    price: variant.price,
                    price_sale: variant.price_sale,
                    colors: variant.colors.map((color) => ({
                        name: color.name,
                        image: `${process.env.URL}${color.image}`,
                        price_extra: color.price_extra,
                        status: product.status,
                        quantity: color.quantity,
                    })),
                });
            }

            // tính toán xem sản phẩm bao nhiêu sao
            const reviews = await reviewModel.find({ product_id: product._id })
            let rating = null
            if (reviews.length) rating = reviews.reduce((sum, e) => sum + e.rating, 0) / reviews.length

            const brand = await brandModel.findById(product.brand_id)
            const category = await categoryModel.findById(product.category_id)

            data.push({
                id: product._id,
                name: product.name,
                images: product.images.map((image) => `${process.env.URL}${image}`),
                variants: variants,
                view: product.view,
                rating: rating,
                description: product.description,
                brand: {
                    id: brand._id,
                    name: brand.name
                },
                category: {
                    id: category._id,
                    name: category.name
                },
            });
        }

        return { status: 200, message: "Thành công !", data: data }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function getTotalPagesByQuery({ search, id, categoryid, price, limit = 5 }) {
    try {
        let matchCondition = {};

        // Tìm kiếm sản phẩm theo tên
        if (search) {
            matchCondition.name = {
                $regex: search,
                $options: "i",
            };
        }

        // Tìm kiếm sản phẩm theo nhiều id nối bằng dâu '-'
        if (id) {
            matchCondition._id = {
                $in: id.split("-").map((_id) => new ObjectId(_id)),
            };
        }

        // Tìm kiếm sản phẩm theo nhiều id danh mục nối bằng dấu '-'
        if (categoryid) {
            matchCondition.category_id = {
                $in: categoryid.split("-").map((idCat) => new ObjectId(idCat)),
            };
        }

        // Tìm kiếm sản phẩm theo giá từ đên nối bằng dấu '-'
        if (price) {
            const [min, max] = price.split("-");
            matchCondition.finalPrice = {
                $gte: +min,
                $lte: +max,
            };
        }

        const pipeline = [
            {
                $addFields: {
                    finalPrice: {
                        $subtract: [
                            { $arrayElemAt: ["$variants.price", 0] },
                            { $ifNull: [{ $arrayElemAt: ["$variants.price_sale", 0] }, 0] }
                        ]
                    },
                    percent: {
                        $round: [
                            {
                                $multiply: [
                                    {
                                        $divide: [
                                            { $ifNull: [{ $arrayElemAt: ["$variants.price_sale", 0] }, 0] },
                                            { $arrayElemAt: ["$variants.price", 0] }
                                        ]
                                    },
                                    100
                                ]
                            },
                            0 // Làm tròn số nguyên
                        ]
                    }
                }
            },
            { $match: matchCondition },
        ];

        const products = await productModel.aggregate(pipeline);

        const data = Math.ceil(products.length / limit);

        return { status: 200, message: "Thành công !", data: data }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function getSame(query) {
    try {

        const { id, limit = 5 } = query

        const product = await productModel.findById(id);
        if (!product) return { status: 400, message: "Sản phẩm không tồn tại !" }

        const category = await categoryModel.findById(product.category_id);

        const productsSame = await productModel
            .find({ category_id: category._id, _id: { $ne: product._id } })
            .sort({ _id: -1 })
            .limit(limit);

        const data = [];

        for (const product of productsSame) {

            const variants = [];

            for (const variant of product.variants) {

                const propertyNames = [];

                for (const property_id of variant.property_ids) {
                    const property = await propertyModel.findById(property_id);
                    propertyNames.push({ name: property?.name, type: property?.type });
                }

                variants.push({
                    properties: propertyNames,
                    price: variant.price,
                    price_sale: variant.price_sale,
                    colors: variant.colors.map((color) => ({
                        name: color.name,
                        image: `${process.env.URL}${color.image}`,
                        price_extra: color.price_extra,
                        status: product.status,
                        quantity: color.quantity,
                    })),
                });
            }

            const reviews = await reviewModel.find({ product_id: product._id })
            let rating = null
            if (reviews.length) rating = reviews.reduce((sum, e) => sum + e.rating, 0) / reviews.length

            const brand = await brandModel.findById(product.brand_id)
            const category = await categoryModel.findById(product.category_id)

            data.push({
                id: product._id,
                name: product.name,
                images: product.images.map((image) => `${process.env.URL}${image}`),
                variants: variants,
                view: product.view,
                rating: rating,
                description: product.description,
                brand: {
                    id: brand._id,
                    name: brand.name
                },
                category: {
                    id: category._id,
                    name: category.name
                },
            });
        }

        return { status: 200, message: "Thành công !", data: data }
    } catch (error) {
        console.log(error);
        throw error;
    }
}