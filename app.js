const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');
const tourRouter = require('./Routes/tourRoutes');
const userRouter = require('./Routes/userRoutes');
const AppError = require('./utils/appError');
const globelErrorHandler = require('./Controller/errorController');

const app = express();

// 1. Globel Middlewares
// Set Security HTTP Headers
app.use(helmet());
// devlopment loging environment
if (process.env.NODE_ENV === 'devlopment') {
  app.use(morgan('dev'));
}
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('tiny'));
}
//Limit requests from same api
const limiter = rateLimit({
  max: 100, //100 request
  windowMs: 60 * 60 * 1000, //per hours (Ms:mili sec)
  message: 'To many requests from this IP, Please try again in an hour!',
});
app.use('/api', limiter);
// body parser, basically reading data from req.body
app.use(express.json({ limit: '10kb' })); //if body size will increase from 10kb then not be accepted
// Data senitization against NOSql Query injection
app.use(mongoSanitize());
// Data senitization against XSS(cross side scripting)
app.use(xssClean());
//Prevent parameter Polution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingQuantity',
      'ratingAverages',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);
// Test middleware
app.use((req, res, next) => {
  // console.log("hello from middleware")
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
}); //medilware that modify the incoming req data
app.use(express.static(`${__dirname}/public`));
// 2.Route Handlers

// 3.Routes

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//Operational error
// unhandled routes it wiil written at the end if we will write this at above then every routes will respose this route because of this start "*"
app.all('*', (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} on this server!`, 404));
});
app.use(globelErrorHandler);
// 4.Start Server

module.exports = app;
