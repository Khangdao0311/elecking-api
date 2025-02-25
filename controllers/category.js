var categoryModel = require("../models/category");

const { ObjectId } = require("mongodb");

module.exports = {
    getById,
    getQuery
};

async function getById(id) {
    try {
        const category = await categoryModel.findById(id);
        if (!category) return { status: 400, message: "Danh mục không tồn tại !" }

        const data = {
            id: category._id,
            name: category.name,
            image: `${process.env.URL}${category.image}`,
            status: category.status,
            properties: category.properties,
            description: category.description,
        };

        return { status: 200, messgae: "Thành công !", data: data }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function getQuery({ id, search, orderby, page = 1, limit = 5 }) {
    try {
        let matchCondition = {};

        if (search) {
            matchCondition.name = {
                $regex: search,
                $options: "i",
            };
        }

        if (id) {
            matchCondition._id = {
                $in: id.split("-").map((_id) => new ObjectId(_id)),
            };
        }

        let sortCondition = {};

        if (orderby) {
            const [sort, so] = sort.split("-");
            sortCondition[sort] = so == "desc" ? -1 : 1;
        } else {
            sortCondition._id = -1;
        }

        const skip = (page - 1) * limit;

        const pipeline = [
            { $match: matchCondition },
            { $sort: sortCondition },
            { $skip: skip },
            { $limit: +limit },
        ];

        const categories = await categoryModel.aggregate(pipeline);

        const data = categories.map((category) => ({
            id: category._id,
            name: category.name,
            image: `${process.env.URL}${category.image}`,
            status: category.status,
            properties: category.properties,
            description: category.description,
        }));

        return { status: 200, message: "Thành công !", data: data };
    } catch (error) {
        console.log(error);
        throw error;
    }
}


// async function getTotalPagesQuery(query) {
//   try {
//     const { search, limit = 5 } = query;

//     let matchCondition = {};

//     if (search) {
//       matchCondition.name = {
//         $regex: search,
//         $options: "i",
//       };
//     }

//     const pipeline = [{ $match: matchCondition }];

//     const categories = await categoryModel.aggregate(pipeline);

//     const data = Math.ceil(categories.length / limit);

//     return data;
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// }

// async function getCategoryhasProduct() {
//   try {
//     const categories = await categoryModel.aggregate([
//       {
//         $lookup: {
//           from: "products",
//           localField: "_id",
//           foreignField: "category_id",
//           as: "products",
//         },
//       },
//       {
//         $match: {
//           products: { $ne: [] },
//         },
//       },
//       {
//         $project: {
//           _id: 1,
//           name: 1,
//         },
//       },
//     ]);
//     const data = categories.map((category) => ({
//       id: category._id,
//       name: category.name,
//     }));
//     return data;
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// }

// async function insert(data) {
//   try {
//     const { name } = data;
//     const categoryNew = new categoryModel({ name });
//     const result = await categoryNew.save();
//     return result;
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// }

// async function cancel(id) {
//   try {
//     const category = await categoryModel.findById(id);
//     const products = await productModel.find({ category_id: category._id });
//     if (products.length) throw new Error("Còn Sản Phẩm Trong Danh Mục");
//     const result = categoryModel.findByIdAndDelete(id);
//     return result;
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// }

// async function update(id, data) {
//   try {
//     const category = await categoryModel.findById(id);
//     if (!category) throw new Error("Không Tìm Thấy Danh Mục !");
//     const result = await categoryModel.findByIdAndUpdate(id, data);
//     return result;
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// }
