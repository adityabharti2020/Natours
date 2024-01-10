const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.err.path} : ${err.err.value}`;
  return new AppError(message, 400);
};
const handleDuplicateFieldDB = (err) => {
  // console.log("duplicate name ",err.err.keyValue.name)
  const message = `duplicate field name : ${err.err.keyValue.name} Please use another value`;
  return new AppError(message, 400);
}
const handleValidationErrorDB = (err) =>{
  // console.log("validation error ",err.err.errors)
  const errors = Object.values(err.err.errors).map(el => el.message)
  const message = `invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
}
const handleJWTError = err => new AppError('Invalid token! Please login again.',401); 
const handleJWTExpiryError = err => new AppError('token has expired! please login again.',401); 
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
const sendErrorProd = (err, res) => {
  // console.log("in send prod",err)

  //Operational error for send message to the client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    //programming error mean unknown error that dont leak to the client
  } else {
    //1.Log error
    console.log('Error', err);
    //2.send genric message
    res.status(500).json({
      status: 'error',
      message: 'something went wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  // console.log("error name",err.name)
  if (process.env.NODE_ENV === 'devlopment') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    console.log('error ',error.name)
    if(error.name === 'CastError') error = handleCastErrorDB(error);
    if(error.code === 11000 ) error = handleDuplicateFieldDB(error);
    if(error.name === 'ValidationError' ) error = handleValidationErrorDB(error);
    if(error.name === 'JsonWebTokenError' ) error = handleJWTError(error);
    if(error.name === 'TokenExpiredError' ) error = handleJWTExpiryError(error);
    
    sendErrorProd(error, res);
  } 
};
