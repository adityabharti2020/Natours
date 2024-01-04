const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./Routes/tourRoutes');
const userRouter = require('./Routes/userRoutes');

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

// 4.Start Server

module.exports = app;
