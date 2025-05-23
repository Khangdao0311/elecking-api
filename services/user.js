var userModel = require("../models/user");

module.exports = {
    updateStatus
};

async function updateStatus(id, body) {
    try {
        const user = await userModel.findById(id)
        if (!user) return { status: 400, message: "Người dùng không tồn tại !" }

        const { role, status } = body

        if (![0, 1].includes(+role)) return { status: 400, message: "Vai trò không tồn tại !" }
        if (![0, 1, 2, 3].includes(+status)) return { status: 400, message: "Trạng thái không tồn tại !" }

        const data = await userModel.findByIdAndUpdate(id, {
            $set: {
                role: +role,
                status: +status,
            }
        }, { new: true })

        return { status: 200, message: "Success", data: data }
    } catch (error) {
        console.log(error);
        throw error;
    }
}