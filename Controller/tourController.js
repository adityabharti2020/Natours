const path = require('path');
const Tour = require('../Model/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

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

//  exports.getAlltours = catchAsync(async (req, res, next) => {
// try {
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

//  This is without try catch
//   const Features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitingField()
//     .paginate();
//   const tour = await Features.query;
//   // const queryString = Tour.find().where('duration').equals(5).where('difficulty').equals('easy')
//   res.status(200).json({
//     status: 'success',
//     results: tour.length,
//     data: {
//       tour,
//     },
//   });
// });

// catchAsync(async (req, res, next) => {
// try {
// const tour = await Tour.findById(req.params.id).populate('reviews');
// if (!tour) {
//   return next(new AppError('No tour found with that ID', 404));
// }
// res.status(200).json({
//   status: 'success',
//   data: {
//     tour,
//   },
// });
// } catch (error) {
//   res.status(404).json({
//     status: 'failed',
//     message: error,
//   });
// }
// });

// exports.createTour = catchAsync(async (req, res, next) => {
// try {
// const newTour = await Tour.create(req.body);
// if (!newTour) {
//   return next(new AppError('no tour found with this ID ', 404));
// }
// res.status(201).json({
// status: 'success',
// data: {
// tour: newTour,
// },
// });
// } catch (error) {
//   res.status(404).json({
//     status: 'failed',
//     message: error,
//   });
// }
// });
exports.getAlltours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
exports.updateTour = factory.updateOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingAverages: { $gte: 4.1 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: 'ratingQuantity' },
        avgRating: { $avg: '$ratingAverages' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: {
        avgPrice: 1,
      },
    },
    {
      $match: { _id: { $ne: 'EASY' } },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});
// exports.getMonthlyPlan = async (req, res) => {
//   try {
//     const year = req.params.year * 1; //2021
//     const plan = await Tour.aggregate([
//       {
//         $unwind: '$startDates',
//       },
//       {
//         $match: {
//           startDates: {
//             $gte: new Date(`${year}-01-01`),
//             $lte: new Date(`${year}-12-31`),
//           },
//         },
//       },
//       {
//         $group: {
//           _id: { $month: '$startDates' },
//           numTourStarts: {
//             $sum: 1,
//           },
//         },
//       },
//       {
//         $project: {
//           _id: 0, // Exclude the default _id field
//           monthName: {
//             $let: {
//               vars: {
//                 months: [
//                   'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
//                 ]
//               },
//               in: {
//                 $arrayElemAt: ['$$months', '$_id']
//               }
//             }
//           },
//           numTourStarts: 1, // Include the numTourStarts field
//         },
//       },
//     ]);
//     res.status(200).json({
//       status: 'success',
//       data: {
//         plan,
//       },
//     });
//   } catch (error) {
//     res.status(404).json({
//       status: 'failed',
//       message: error,
//     });
//   }
// };

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; //2021
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: 1 },
    },
    {
      $limit: 12,
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
// /tours-within/:distance/center/:latlng/unit/:unit
// /tour-within?distance=233,center=-40,45,unit=mi
// /tour-within/233/center/34.111745, -118.113491/unit/mi
exports.getToursWithIn = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  // 3963.2 is earth radius in miles and 6378.1 is earth radius in kilometer
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide latitute and longitute in the format lat,lng',
        404,
      ),
    );
  }
  //GeoWithin it's Geo Spatial Operator
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  // console.log(distance, lat, lng, unit);
  // console.log(tours);
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});
exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const multiPlier = unit === 'mi' ? 0.000621371 : 0.001; // to convert meter to mile 0.000621371 and kilometer 0.001
  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide latitute and longitute in the format lat,lng',
        404,
      ),
    );
  }
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1], //multiply by 1 to convert from string to number
        },
        distanceField: 'distance',
        distanceMultiplier: multiPlier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});
