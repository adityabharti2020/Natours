const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! Shuting down....');
  console.log(err.name, err.message);
  process.exit(1); //to sutdown the app
});
dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('DB connection successful!'));
// console.log(app.get('env'))
console.log(process.env.NODE_ENV);
// console.log(process.env);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log('app is running on', port);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shuting down....');
  console.log(err.name, err.message);

  server.close(() => {
    process.exit(1); //to sutdown the app
  });
});
