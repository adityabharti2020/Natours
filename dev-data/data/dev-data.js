const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const tour = require('../../Model/tourModel')

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
  const tours =JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,'utf-8'));


//   Import Data into Database
const importData = async() => {
    try { 
        await tour.create(tours);
        console.log("data successfully loaded");
        
    } catch (error) {
        console.log(error)
    }
    process.exit();
}
// Delete All data from the collection
const deleteData = async() => {
    try {
        await tour.deleteMany();
        console.log("data successfully deleted");
    } catch (error) {
        console.log(error)
    }
    process.exit();
}
if(process.argv[2] === "--import"){
    importData(); 
} else if(process.argv[2] === "--delete"){
    deleteData();
}
console.log(process.argv)