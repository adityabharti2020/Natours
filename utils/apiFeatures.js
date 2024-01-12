class APIFeatures {
    constructor(query,queryString){
      this.query = query;
      this.queryString = queryString;
      // console.log(this.queryString);
    }
    filter(){
      const queryObj = { ...this.queryString };
      const excludesFields = ['page', 'sort', 'limit', 'fields'];
      excludesFields.forEach((e1) => delete queryObj[e1]);
      // const tour = await Tour.find(queryObj);
  
      // 1B.Advanced Filtering
      let queryStr = JSON.stringify(queryObj);
      queryStr = queryStr.replace(
        /\b(gte|gt|lte|lt)\b/g, //RegEX to search and replace that string with match
        (match) => `$${match}`,
      );
    //   console.log(queryStr)
  
      // console.log(JSON.parse(queryString));
      // {difficulty:"easy",duration:{$gte:5}}
      // {difficulty:"easy",duration:{gte:5}}
      // gte,gt,lte,lt
      // const query = Tour.find(queryObj);
     this.query.find(JSON.parse(queryStr))
      // let query = Tour.find(JSON.parse(queryString));
      return this;
    }
    sort(){
      if (this.queryString.sort) {
        console.log(this.queryString.sort)
        const sortBy = this.queryString.sort.split(',').join(' ');
        console.log(sortBy);
        // query = query.sort(req.query.sort) for sorting as acsending and decsending
        this.query = this.query.sort(sortBy); //If same value and need another parameter to sort them
      } else {
        this.query = this.query.sort('-createdAt');
      }
      return this;
    }
    limitingField(){
      if (this.queryString?.fields) {
        const fields = this.queryString?.fields.split(',').join(' ');
        this.query = this.query.select(fields);
      } else {
        this.query = this.query.select('-__v');
      }
      return this;
    }
    paginate(){
      const page = (this.queryString.page * 1) | 1;
      const limit = this.queryString.limit * 1 || 100;
      const skip = (page - 1) * limit;
      this.query = this.query.skip(skip).limit(limit);
      // if (this.queryString.page) {
      //   const numTours = await Tour.countDocuments();
      //   if (skip >= numTours) throw new Error('This page does not exist');
      // }
      return this;
    }
  }
  module.exports = APIFeatures;