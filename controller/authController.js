const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require("../utils/appError");
const sendEmail = require('../utils/Email');
const crypto = require('crypto');

const signToken = id => {
    return jwt.sign({id}, process.env.JWT_SECRET,{expiresIn: process.env.JWT_EXPIRES_IN});
}

const createSentToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOption = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true
    }

    if(process.env.NODE_ENV  == 'production') cookieOption.secure = true;
    res.cookie('jwt', token, cookieOption);

    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
}

exports.signup = catchAsync(async (req,res,next) => {
    const newUser = await User.create(req.body);
    createSentToken(newUser, 201, res);
    //const token = signToken(newUser._id);
});

exports.login = catchAsync(async(req, res, next) => {
    const { email, password } = req.body;

    //1) Check if email and password exist
    if (!email || !password) {
       return next(new AppError('Please provide email and password', 400));
    }
    //2) Check is user exists && password is correct 
    const user = await User.findOne({ email }).select('+password')

    if (!user || !await user.correctPassword(password, user.password)) {
        return next(new AppError('incorrect email or password', 401));
    }
    //3) if everything ok, send token to client
    createSentToken(user, 200, res);
    /* const token = signToken(user._id);
    
    res.status(200).json({
        status: 'succes',
        token
    }); */
});

exports.protect = catchAsync(async(req, res, next) => {
    //1) Getting token and check
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1]; 
    }
   console.log(token);

    if(!token){
        return next(new AppError('you are not logged in! Please log in to get access', 401));
    }
   //2) Verification token

   
   const decode =  await promisify(jwt.verify)(token, process.env.JWT_SECRET);
   //console.log(decode);

    //3) check if user still exist
    const user = await User.findById(decode.id);

    if(!user){
        return next(new AppError('The user belonged to this token does no longer exist', 401))
    }
    
    //4) check if user changed password
 
    if(user.changepasswordAfter(decode.iat)){
        return next(new AppError('user recently changed password! Please log in again', 401))
    }

    req.user = user; 

    next();
});

exports.restrictTo = (...roles) => {
    return(req, res, next) => {
        if(!roles.includes(req.user.role)){
           return next(new AppError('you do not have permission to perform this action', 403));
        }
        next();
    }
}


exports.forgotPassword = catchAsync(async (req, res, next) => {
    //1) Get user Email 
    const user = await User.findOne({email: req.body.email});
    if(!user){
        return next(new AppError('There is no user this email address', 404));
    }
    //2) Generate random reset token
    const resetToken = user.createPasswordResetToken();

    await user.save({ validateBeforeSave: false });
    //3) send it to users Email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/forgotPassword/${resetToken}`;

    const message = `Forgot your password ? please go to ${resetURL} \n if you didn't forget your password , please ignore this email`;

    try {
        await sendEmail({
        email: user.email,
        subject: 'your password resest token (valid for 10 min)',
        message
    });
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave: false});

        return next(new AppError('Error sending the email try again later', 500));
    }
    

    res.status(200).json({
        status: "success",
        message: "Token sent to Email"
    });
    
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    //1) Get user token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now()} });
    //2) If token has not expired
    if(!user){
        return next(new AppError('Token is invalid or has expired', 400));
    }
    //3) Update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();
    //4) send new jwt
    createSentToken(user, 201, res);
    /* const token = signToken(user._id);

    res.status(201).json({
        status: 'succes',
        token 
    }); */
});

exports.updatePassword = catchAsync(async(req, res, next) => {
    // 1) Get user current password
    const user = await User.findById(req.user.id).select('+password');
    // 2) Check if password is correct
    if(!(await user.correctPassword(req.body.passwordCurrent, user.password))){
        return next(new AppError('your current password is wrong', 401));
    }
    // 3) update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    // 4) log user in send jwt
    createSentToken(user, 200, res);
    next();
});
