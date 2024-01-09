const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const TourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength:[40,'A tour name must be less than 40 or equal to 40 character'],
      minlength:[10,'A tour name must be greater than 10 or equal to 40 character']
      // validate:[validator.isAlpha,'Tour Name must only contain character']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a groups size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have difficulty level'],
      trim: true,
      enum:{
        values:['easy','medium','difficult'],
        message:"Difficulty is either easy , medium , difficult",
      }
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount:{
      type:Number,
      validate:{
        validator:function(val){
        return val < this.price  //250<200
      },
      message:"discount price {VALUE} should be less than the actual price"
    }
  },
    ratingAverages: {
      type: Number,
      default: 4.5,
      validate:{
        validator:function(val){
        return val <= 5   //250<200
      },
      message:"ratingAverages should be less than 5"
    }
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must Have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must Have cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      // select:false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  // {timestamps:true}
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  },
);
TourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
//Document middleware: runs before .save() and .create()
// TourSchema.pre('save', function (next) {
//   this.slug = slugify(this.name, { lower: true });
//   next();
// });
// TourSchema.pre('save', function (next) {
//   console.log('will save document....')
//   next();
// });
// TourSchema.post('save',function(doc,next){
// console.log(doc)
//   next();
// })

//Query middleware
// TourSchema.pre('find', function (next) {
TourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});
TourSchema.post(/^find/, function (docs, next) {
  console.log(`query took  ${Date.now() - this.start} miliseconds!`);
  // console.log(docs);
  next();
});
// Aggregation middleware
TourSchema.pre('aggregate', function (next) {
  //in this function this keyword will represent the current aggeregation document
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', TourSchema);
module.exports = Tour;
