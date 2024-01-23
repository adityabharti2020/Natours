const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const tour = require('../../Model/tourModel');
const User = require('../../Model/userModel');
const Review = require('../../Model/reviewModel');

dotenv.config({ path: './config.env' });
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

//   Read File
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'),
);

//   Import Data into Database
const importData = async () => {
  try {
    await tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);

    console.log('data successfully loaded');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};
// Delete All data from the collection
const deleteData = async () => {
  try {
    await tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('data successfully deleted');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
console.log(process.argv);
