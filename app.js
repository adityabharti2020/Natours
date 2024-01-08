const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./Routes/tourRoutes');
const userRouter = require('./Routes/userRoutes');
const AppError = require('./utils/appError');
const globelErrorHandler =require('./Controller/errorController')

const app = express();

// 1. Middleware
if (process.env.NODE_ENV === 'devlopment') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use((req, res, next) => {
  // console.log("hello from middleware")
  req.requestTime = new Date().toISOString();
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
