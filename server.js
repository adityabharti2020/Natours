const mongoose = require('mongoose');

const dotenv = require('dotenv');

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
  .then((con) => console.log('DB connection successful!'))
  .catch((error) => console.log('mongodb error', error));
// console.log(app.get('env'))
// console.log(process.env);


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('app is running on',port);
});
