const path = require('path');
const Tour = require('../Model/tourModel');
const APIFeatures = require('../utils/apiFeatures');
// const fs = require('fs');
// const filePath = path.join(
//   __dirname,
//   '..',
//   'dev-data',
//   'data',
//   'tours-simple.json',
// );
// const tour = JSON.parse(fs.readFileSync(filePath));

// exports.checkId = (req, res, next, val) => {
// const findtour = tour.find((e1) => e1.id === val * 1);
// if (!findtour) {
//   return res.status(404).json({ status: 'failed', message: 'INVALID ID' });
// }
// next();
// };
// exports.checkbody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     res.status(400).json({
//       status: 'Bad request',
//       message: 'missing name and price',
//     });
//   }
//   next();
// };
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingAverages,price';
  req.query.sort.fields = 'name,price,ratingAverages,summary,difficulty';
  next();
};

exports.getAlltours = async (req, res) => {
  try {
    // console.log(req.query);

    //Build the qiery when we was not using class and constructor
    // 1A) Filtering
    // const queryObj = { ...req.query };
    // const excludesFields = ['page', 'sort', 'limit', 'fields'];
    // excludesFields.forEach((e1) => delete queryObj[e1]);
    // // const tour = await Tour.find(queryObj);

    // // 1B.Advanced Filtering
    // let queryString = JSON.stringify(queryObj);
    // queryString = queryString.replace(
    //   /\b(gte|gt|lte|lt)\b/g, //RegEX to search and replace that string with match
    //   (match) => `$${match}`,
    // );
    // // console.log(JSON.parse(queryString));
    // // {difficulty:"easy",duration:{$gte:5}}
    // // {difficulty:"easy",duration:{gte:5}}
    // // gte,gt,lte,lt
    // // const query = Tour.find(queryObj);

    // let query = Tour.find(JSON.parse(queryString));

    // 2.Sorting
    // if (req.query.sort) {
    //   const sortBy = req.query.sort.split(',').join(' ');
    //   console.log(sortBy);
    //   // query = query.sort(req.query.sort) for sorting as acsending and decsending
    //   query = query.sort(sortBy); //If same value and need another parameter to sort them
    // } else {
    //   query = query.sort('-createdAt');
    // }

    // 3)Field Limiting
    // if (req?.query?.fields) {
    //   const fields = req?.query?.fields.split(',').join(' ');
    //   query = query.select(fields);
    // } else {
    //   query = query.select('-__v');
    // }
    // 4.Pagination
    // page=2&limit=10 page1 = 1-10,page2 = 2-20
    // const page = (req.query.page * 1) | 1;
    // const limit = req.query.limit * 1 || 100;
    // const skip = (page - 1) * limit;
    // query = query.skip(skip).limit(limit);
    // if (req.query.page) {
    //   const numTours = await Tour.countDocuments();
    //   if (skip >= numTours) throw new Error('This page does not exist');
    // }
    // Excute the query
    const Features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitingField()
      .paginate();
    const tour = await Features.query;
    // const queryString = Tour.find().where('duration').equals(5).where('difficulty').equals('easy')
    res.status(200).json({
      status: 'success',
      results: tour.length,
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'failed',
      message: error,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'failed',
      message: error,
    });
  }
};
exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(200).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'failed',
      message: error,
    });
  }
};
exports.deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: 'deleted successfully',
      data: { tour },
    });
  } catch (error) {
    res.status(400).json({
      status: 'failed',
      message: error,
    });
  }
};
exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'successfully updated',
      data: { tour },
    });
  } catch (error) {
    res.status(404).json({
      status: 'failed',
      message: error,
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingAverages: { $gte: 4.1 } },
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$ratingAverages' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'failed',
      message: error,
    });
  }
};
