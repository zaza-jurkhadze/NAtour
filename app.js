const express = require('express');
const morgan = require('morgan');

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorControler');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

app.use(helmet());

app.use(morgan('tiny'));

const limiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this ip, please try in an hour'
  });
  
  //  apply to all requests
app.use('/api',limiter);

app.use(express.json({ limit: '10kb' }));
/* app.use((req,res,next) => {
    console.log('hello from the middleware !!!');
    next();
}); */

// data Sanitization against NoSQL query injenction
app.use(mongoSanitize());

//data sanitization against xss
app.use(xss());

app.use((req,res,next) => {
    req.requestTime = new Date().toISOString();
    //console.log(req.headers);
    next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users',userRouter);

app.all('*', (req,res,next) => {
    next(new AppError(`can't find ${req.originalUrl} on this server!!!`, 404));
});
app.use(globalErrorHandler);


module.exports = app;