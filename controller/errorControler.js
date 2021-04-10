const AppError = require("../utils/appError");

const handleCastErrorDB = err => {
    const message = ` invalid ${err.path} ${err.value}`;
    return new AppError(message, 400);
};
const handleDublicateFieldsDB = err => {
    const value = err.message.match(/(["'])(?:\\.|[^\\])*?\1/)[0];
    
    const message = `Dublicate field value: ${value} Please use another value`
    return new AppError(message, 400);
};
const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `invalid input data. ${errors.join('. ')}`
    return new AppError(message, 400);
};

const handleJsonWebTokenError = () => new AppError('invalid token. Please log in again', 401);
const handleTokenExpiredError = () => new AppError('Your token has expired! Please log in again', 401);
const sendErrorDEV = (err, res) => {
            res.status(err.statusCode).json({
            status: err.statusCode,
            error: err,
            message: err.message,
            stack: err.stack
        });
}
const sendErrorProd = (err, res) => {
    //operational error
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.statusCode,
            message: err.message
        });
        //programing or other error
    }else{
        //log error
        console.error('error:', err);
        //send generic message
        res.status(500).json({
        status: 'error',
        message: 'something went wrong !!!'
    });
}
}
module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    
   
    if(process.env.NODE_ENV === 'development'){
        sendErrorDEV(err, res);

    } else if(process.env.NODE_ENV === 'production'){
        let error = {...err};
        if(err.name === 'CastError') error = handleCastErrorDB(error);
        if(error.code === 11000) error = handleDublicateFieldsDB(err);
        if(err.name === 'ValidationError')  error = handleValidationErrorDB(err);      
        if(err.name === 'JsonWebTokenError')  error = handleJsonWebTokenError();  
        if(err.name === 'TokenExpiredError')  error = handleTokenExpiredError();      
    
      sendErrorProd(error,res);
    }
};     

