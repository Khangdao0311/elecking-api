var categoryModel = require("../models/category");
var proptypeModel = require("../models/proptype");

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
            image: category.image ? `${process.env.URL}${category.image}` : "",
            status: category.status,
            icon: category.icon,
            proptypes: category.proptypes,
            description: category.description,
        };

        return { status: 200, messgae: "Success", data: data }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function getQuery(query) {
    try {
        const { id, search, orderby, page = 1, limit = null } = query

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
            const [sort, so] = orderby.split("-");
            sortCondition[sort == "id" ? "_id" : sort] = so ? so == "desc" ? -1 : 1 : -1;
        } else {
            sortCondition._id = -1;
        }

        const pipeline = [
            { $match: matchCondition },
            { $sort: sortCondition },
        ];

        if (+limit && !isNaN(+limit)) {
            const skip = (page - 1) * limit;
            pipeline.push({ $skip: skip },);
            pipeline.push({ $limit: +limit });
        }

        const pipelineTotal = [
            { $match: matchCondition },
        ];

        const categories = await categoryModel.aggregate(pipeline);
        const categoriesTotal = await categoryModel.aggregate(pipelineTotal);

        const data = []

        for (const category of categories) {

            const proptypes = []

            for (const proptype_id of category.proptypes) {
                const proptype = await proptypeModel.findById(proptype_id)
                proptypes.push({
                    id: proptype._id,
                    name: proptype.name
                })
            }

            data.push({
                id: category._id,
                name: category.name,
                image: category.image ? `${process.env.URL}${category.image}` : "",
                status: category.status,
                icon: category.icon,
                proptypes: proptypes,
                description: category.description,
            })
        }

        return { status: 200, message: "Success", data: data, total: categoriesTotal.length };
    } catch (error) {
        console.log(error);
        throw error;
    }
}