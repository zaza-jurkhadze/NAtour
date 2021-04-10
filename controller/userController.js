const AppError = require('../utils/appError');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

const filterObj = (obj, ...allowFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if(allowFields.includes(el)) newObj[el] = obj[el]
    });
    return newObj;
}

exports.getAllUsers = catchAsync(async(req, res, next) => {
    const users = await User.find();

    res.status(500).json({
        status: "succes",
        results: users.length,
        data: {
            users
        }
    });
});

exports.updateMe = catchAsync(async(req, res, next) => {
    // 1) create error if user POSTs password data
    if(req.body.password || req.body.confirmPassword){
        return next(new AppError('this route is not for password updates. Please use /updateMyPassword', 400))
    }

    // 3) filtered
    const filterBody = filterObj(req.body, 'name', 'email');
    // 3) update user document
    const updateUser = await User.findByIdAndUpdate(req.user.id, filterBody, { new: true, runValidators: true });
   
    res.status(200).json({
        status: 'success',
        data: {
            user: updateUser
        }
    });
});
exports.getUser = (req,res) => {
    res.status(500).json({
        status: "error",
        message: "this route is not defined yet!"
    });
};
exports.updateUser = (req,res) => {
    res.status(500).json({
        status: "error",
        message: "this route is not defined yet!"
    });
};
exports.deleteUser = (req,res) => {
    res.status(500).json({
        status: "error",
        message: "this route is not defined yet!"
    });
};
exports.createUsers = (req,res) => {
    res.status(500).json({
        status: "error",
        message: "this route is not defined yet!"
    });
};